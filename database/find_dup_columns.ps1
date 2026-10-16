param(
    [string]$SqlFile = "$PSScriptRoot\hotel_hr.sql",
    [string]$OutFile = "$PSScriptRoot\duplicate_columns_report.txt"
)

$sql = Get-Content $SqlFile -Raw

# Match each CREATE TABLE block (name + body up to the closing ") ENGINE")
$rx = [regex]'(?s)CREATE TABLE (?:IF NOT EXISTS )?`([a-zA-Z0-9_]+)`\s*\((.*?)\n\)\s*ENGINE'

$colMap = @{}      # column -> [tables]
$tableCols = @{}   # table  -> [columns]
$tableOrder = New-Object System.Collections.Generic.List[string]

foreach ($m in $rx.Matches($sql)) {
    $table = $m.Groups[1].Value
    $body  = $m.Groups[2].Value
    if (-not $tableCols.ContainsKey($table)) {
        $tableCols[$table] = New-Object System.Collections.Generic.List[string]
        $tableOrder.Add($table)
    }
    foreach ($line in ($body -split "`n")) {
        $t = $line.Trim()
        # A column definition line starts with a backticked identifier
        if ($t -match '^`([a-zA-Z0-9_]+)`\s') {
            $col = $matches[1]
            $tableCols[$table].Add($col)
            if (-not $colMap.ContainsKey($col)) {
                $colMap[$col] = New-Object System.Collections.Generic.List[string]
            }
            if (-not $colMap[$col].Contains($table)) { $colMap[$col].Add($table) }
        }
    }
}

$lines = New-Object System.Collections.Generic.List[string]
$lines.Add("DUPLICATE COLUMN REPORT")
$lines.Add("Source: $SqlFile")
$lines.Add("Tables parsed: $($tableCols.Count)")
$lines.Add("Distinct columns: $($colMap.Count)")
$lines.Add("")

# Columns appearing in 2+ tables, sorted by how many tables use them
$dups = $colMap.GetEnumerator() | Where-Object { $_.Value.Count -ge 2 } | Sort-Object { $_.Value.Count } -Descending

$lines.Add("COLUMNS THAT APPEAR IN 2+ TABLES (count = number of tables):")
$lines.Add("=" * 80)
foreach ($e in $dups) {
    $lines.Add(("{0,-28} x{1}  ->  {2}" -f $e.Key, $e.Value.Count, ($e.Value -join ', ')))
}

$lines.Add("")
$lines.Add("PER-TABLE COLUMN LISTS:")
$lines.Add("=" * 80)
foreach ($t in $tableOrder) {
    $lines.Add("[$t] ($($tableCols[$t].Count) cols)")
    $lines.Add("   " + ($tableCols[$t] -join ', '))
}

Set-Content -Path $OutFile -Value $lines -Encoding UTF8

Write-Output "Tables parsed: $($tableCols.Count)"
Write-Output "Distinct columns: $($colMap.Count)"
Write-Output "Columns in 2+ tables: $(($dups | Measure-Object).Count)"
Write-Output "Report written to: $OutFile"
