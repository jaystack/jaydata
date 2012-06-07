new $data.ModelBinder(Netflix.context).call(window.netflixData, {
    $type: $data.Array,
    $selector: ['json:d.results.0.Titles.results', 'json:d.0.Titles'],
    $item: {
        $type: Netflix.Catalog.v2.Title,
        ShortName: 'ShortName'
    }
})
