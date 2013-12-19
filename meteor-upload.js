if (Meteor.isClient) {
  
  Template.form.events({
  'submit': function(ev, tmpl) {
    ev.preventDefault();
    var fileInput = tmpl.find('input[type=file]');    
    _.each(fileInput.files, function(file) {
      Meteor.saveFile(file, file.name);
      });
    
    }
  });
  
  
  Meteor.saveFile = function(blob, name, path, type, callback) {
  var fileReader = new FileReader(),
    method, encoding = 'binary', type = type || 'binary';
  switch (type) {
    case 'text':
      // TODO Is this needed? If we're uploading content from file, yes, but if it's from an input/textarea I think not...
      method = 'readAsText';
      encoding = 'utf8';
      break;
    case 'binary': 
      method = 'readAsBinaryString';
      encoding = 'binary';
      break;
    default:
      method = 'readAsBinaryString';
      encoding = 'binary';
      break;
  }
  fileReader.onload = function(file) {
    Meteor.call('saveFile', file.srcElement.result, name, path, encoding, callback);
  }
  fileReader[method](blob);
  }
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
    // what do you want
    
  });

  Meteor.methods({
    saveFile: function(blob, name, path, encoding) {
    var path = cleanPath(path), fs = Npm.require('fs'),
      name = cleanName(name || 'file'), encoding = encoding || 'binary',
      chroot = Meteor.chroot || '../../../../../public/';
      console.log("cazzooo ",chroot);
      
    // Clean up the path. Remove any initial and final '/' -we prefix them-,
    // any sort of attempt to go to the parent directory '..' and any empty directories in
    // between '/////' - which may happen after removing '..'
    path = chroot + (path ? '/' + path + '/' : '/');
    
    // TODO Add file existance checks, etc...
    fs.writeFile(path + name, blob, encoding, function(err) {
      if (err) {
        throw (new Meteor.Error(500, 'Failed to save file.', err));
      } else {
        console.log('The file ' + name + ' (' + encoding + ') was saved to ' + path);
      }
    }); 
 
    function cleanPath(str) {
      if (str) {
        return str.replace(/\.\./g,'').replace(/\/+/g,'').
          replace(/^\/+/,'').replace(/\/+$/,'');
      }
    }

    function cleanName(str) {
      return str.replace(/\.\./g,'').replace(/\//g,'');
    }

    }
  });  
}




