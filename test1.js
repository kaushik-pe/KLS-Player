var fs = require('fs');
var mm = require('musicmetadata');
 
// create a new parser from a node ReadStream 
var parser = mm(fs.createReadStream('track1.mp3'), function (err, metadata) {
  if (err) throw err;
  console.log(metadata.picture[0].data);
       fs.writeFile('logo.jpeg', metadata.picture[0].data, 'binary', function(err){
            if (err) throw err
            console.log('File saved.')
        })
});