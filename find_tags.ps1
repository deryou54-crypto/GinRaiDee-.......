$db = Get-Content -Raw -Path "api/foods_db.json" | ConvertFrom-Json
foreach ($meal in $db.psobject.properties.Name) {
    $items = $db.$meal
    for ($i = 0; $i -lt $items.Count; $i++) {
        $item = $items[$i]
        $tags = $item.tags
        if ($tags -ne $null) {
            $isArr = $tags -is [System.Array] -or $tags -is [System.Collections.IList]
            if (-not $isArr) {
                $name = $item.name
                $type = $tags.GetType().FullName
                Write-Host "Meal: $meal, Index: $i, Name: $name, TagsType: $type, Val: $tags"
            }
        }
    }
}
