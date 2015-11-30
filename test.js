var id3 = require('id3js');
var fs = require('fs');
 
id3({ file: 'track.mp3', type: id3.OPEN_LOCAL }, function(err, tags) {
    // tags now contains your ID3 tags 
    console.log(tags);
//      fs.writeFile('logo.png', tags.v2.image.data, 'binary', function(err){
//            if (err) throw err
//            console.log('File saved.')
//        })
});