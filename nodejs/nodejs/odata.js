require('jaydata');
require('./netflix.js');

console.log();
Netflix.context.Titles
    .filter(function(it){ return it.ReleaseYear == this.year; }, { year: 2013 })
    .map(function(it){ return { Title: it.Name, Type: it.Type }})
    .orderBy(function(it){ return it.Name; })
    .take(10)
    .forEach(function(it){ console.log(it); });
