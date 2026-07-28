param(
    [Parameter(Mandatory = $true)]
    [string]$ProjectRoot,

    [string]$DevUrl = "http://localhost:3000",

    [string]$DevCommand = "npm run dev",

    [int]$ReadyTimeoutSeconds = 90
)

$ErrorActionPreference = "Stop"

function Test-DevUrlReady {
    param([string]$Url)

    try {
        $response = Invoke-WebRequest `
            -Uri $Url `
            -UseBasicParsing `
            -TimeoutSec 2 `
            -MaximumRedirection 3

        return $response.StatusCode -ge 200 -and $response.StatusCode -lt 400
    }
    catch {
        return $false
    }
}

function Test-DevPortOpen {
    param([Uri]$Uri)

    $port = if ($Uri.IsDefaultPort) {
        if ($Uri.Scheme -eq "https") { 443 } else { 80 }
    } else {
        $Uri.Port
    }

    $client = [System.Net.Sockets.TcpClient]::new()
    try {
        $connection = $client.ConnectAsync($Uri.Host, $port)
        if (-not $connection.Wait(800)) {
            return $false
        }

        return $client.Connected
    }
    catch {
        return $false
    }
    finally {
        $client.Dispose()
    }
}

function Wait-ForDevUrl {
    param(
        [string]$Url,
        [int]$TimeoutSeconds
    )

    $deadline = [DateTime]::UtcNow.AddSeconds($TimeoutSeconds)
    do {
        if (Test-DevUrlReady -Url $Url) {
            return $true
        }

        Start-Sleep -Milliseconds 750
    } while ([DateTime]::UtcNow -lt $deadline)

    return $false
}

function Get-DevPort {
    param([Uri]$Uri)

    if (-not $Uri.IsDefaultPort) {
        return $Uri.Port
    }

    if ($Uri.Scheme -eq "https") {
        return 443
    }

    return 80
}

function Get-PortOwnerProcessId {
    param([int]$Port)

    $connection = Get-NetTCPConnection `
        -LocalPort $Port `
        -State Listen `
        -ErrorAction SilentlyContinue |
        Select-Object -First 1

    if (-not $connection) {
        return $null
    }

    return [int]$connection.OwningProcess
}

function Get-ProcessChain {
    param(
        [int]$ProcessId,
        [int]$MaxDepth = 8
    )

    $chain = @()
    $currentProcessId = $ProcessId

    for ($depth = 0; $depth -lt $MaxDepth -and $currentProcessId -gt 0; $depth += 1) {
        $process = Get-CimInstance `
            -ClassName Win32_Process `
            -Filter "ProcessId = $currentProcessId" `
            -ErrorAction SilentlyContinue

        if (-not $process) {
            break
        }

        $chain += $process
        $currentProcessId = [int]$process.ParentProcessId
    }

    return $chain
}

function Stop-StaleProjectDevServer {
    param(
        [int]$Port,
        [string]$ProjectRoot,
        [Uri]$Uri
    )

    $ownerProcessId = Get-PortOwnerProcessId -Port $Port
    if (-not $ownerProcessId) {
        return $true
    }

    $processChain = Get-ProcessChain -ProcessId $ownerProcessId
    $projectNextProcesses = @(
        $processChain | Where-Object {
            $commandLine = $_.CommandLine
            $commandLine -and
            $commandLine.IndexOf(
                $ProjectRoot,
                [StringComparison]::OrdinalIgnoreCase
            ) -ge 0 -and
            $commandLine -match "(?i)next"
        }
    )

    if ($projectNextProcesses.Count -eq 0) {
        return $false
    }

    Write-Host "The existing Mehmet Metrics server is stale; restarting it..."
    foreach ($process in $projectNextProcesses) {
        Stop-Process -Id $process.ProcessId -Force -ErrorAction SilentlyContinue
    }

    $deadline = [DateTime]::UtcNow.AddSeconds(10)
    do {
        if (-not (Test-DevPortOpen -Uri $Uri)) {
            return $true
        }

        Start-Sleep -Milliseconds 300
    } while ([DateTime]::UtcNow -lt $deadline)

    return $false
}

function Start-ProjectDevServer {
    param(
        [string]$ProjectRoot,
        [string]$Command
    )

    $cmdLine = "cd /d `"$ProjectRoot`" && $Command"
    $startArguments = @{
        FilePath = $env:ComSpec
        ArgumentList = @("/k", "`"$cmdLine`"")
        WorkingDirectory = $ProjectRoot
    }

    if ($env:MM_HIDDEN_SERVER -eq "1") {
        $startArguments.WindowStyle = "Hidden"
    }

    Start-Process @startArguments
}

$resolvedProjectRoot = (Resolve-Path -LiteralPath $ProjectRoot).Path
$parsedUrl = [Uri]$DevUrl
$devPort = Get-DevPort -Uri $parsedUrl
$isDryRun = $env:MM_DRY_RUN -eq "1"
$skipBrowser = $env:MM_NO_BROWSER -eq "1"

if ($isDryRun) {
    Write-Host "DRY RUN: would reuse a ready server or start `"$DevCommand`" from:"
    Write-Host "         $resolvedProjectRoot"
    Write-Host "DRY RUN: would wait for a successful response from $DevUrl"
    if (-not $skipBrowser) {
        Write-Host "DRY RUN: would open the browser only after the app is ready"
    }
    exit 0
}

$shouldStartServer = $false

if (Test-DevUrlReady -Url $DevUrl) {
    Write-Host "Dev server is already ready at $DevUrl"
}
elseif (Test-DevPortOpen -Uri $parsedUrl) {
    Write-Host "Port $devPort is already occupied; waiting for the existing server..."

    if (-not (Wait-ForDevUrl -Url $DevUrl -TimeoutSeconds 12)) {
        if (
            Stop-StaleProjectDevServer `
                -Port $devPort `
                -ProjectRoot $resolvedProjectRoot `
                -Uri $parsedUrl
        ) {
            $shouldStartServer = $true
        } else {
            Write-Error @"
Port $devPort is occupied by another process, and Mehmet Metrics cannot use it.
Close the process on that port or change the development URL.
"@
            exit 1
        }
    }
}
else {
$shouldStartServer = $true
}

if ($shouldStartServer) {
    Write-Host "Starting `"$DevCommand`"..."
    Start-ProjectDevServer `
        -ProjectRoot $resolvedProjectRoot `
        -Command $DevCommand

    Write-Host "Waiting for the application to compile..."
    if (-not (Wait-ForDevUrl -Url $DevUrl -TimeoutSeconds $ReadyTimeoutSeconds)) {
        Write-Error @"
Mehmet Metrics did not respond successfully within $ReadyTimeoutSeconds seconds.
Check the dev-server window for the first compilation error.
"@
        exit 1
    }
}

if ($skipBrowser) {
    Write-Host "Application is ready at $DevUrl"
} else {
    Write-Host "Application is ready. Opening $DevUrl"
    Start-Process $DevUrl
}
exit 0
