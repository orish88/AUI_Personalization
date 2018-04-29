
// var express = require('express');
// //var server = express.createServer();
// // express.createServer()  is deprecated. 
// var server = express(); // better instead
// server.configure(function(){
//   server.use('/media', express.static(__dirname + '/users'));
//   server.use(express.static(__dirname + '/users'));
// });

// server.listen(3000);

const express = require('express');
const app = express();
const port = 3000;
var fs = require('fs');
var cors = require('cors')

app.use(cors());


// app.use(express.static(__dirname +'/users'));
app.listen(port, (err) => {
  if (err) {
    return console.log('something bad happened', err)
  }

  console.log(`server is listening on ${port}`);
});


// app.use((request, response, next) => {
//     console.log(request.headers);
//     next();
//   })

//   app.use((request, response, next) => {
//     request.chance = Math.random();
//     next();
//   })
app.use((err, request, response, next) => {
  // log the error, for now just console.log
  console.log(err)
  response.status(500).send('Something broke!')
});




app.get('/users/:user_name/profiles/:profile_json_name', (req, res) => {
  //"user1","test_profile7.json"

  // response.send("respone string");
  console.log("get request url: " + req.url);
  console.log(req.params);
  var userName = req.params.user_name;
  var fileName = req.params.profile_json_name;
  var jsonFile = readJsonProfile(userName, fileName);
  res.send(jsonFile);


  // readProfile(request,response);  
});

app.post('/users/:user_name/profiles/:profile_json_name', (req, res) => {
  //"user1","test_profile7.json"

  // response.send("respone string");
  console.log("post request req: " + req);


  console.log(req.params);
  var userName = req.params.user_name;
  var fileName = req.params.profile_json_name;
  var jsonContent = req.data;

  let body = [];
  req.on('data', (chunk) => {
    body.push(chunk);
  }).on('end', () => {
    body = Buffer.concat(body).toString();
    // at this point, `body` has the entire request body stored in it as a string
    writeToJsonProfile(userName, fileName, body, res);
  });

  // res.send({"jsonFile":jsonFile});


  // readProfile(request,response);  
});


function readJsonProfile(userName, fileName) {
  userName = userName.substring(1,userName.length-1);
  createFolder(userName);
  var path = _dirname + '/users/' + userName + '/profiles/' + fileName;
  try{
  var content = fs.readFileSync(path);
  var jsonObj = JSON.parse(content);
  console.log("json Obj keys: " + Object.keys(jsonObj));
  }catch(err){
    console.log("failed to read file: "+path);

  }

  return jsonObj;
}

function writeToJsonProfile(userName, fileName, jsonContent, res) {
  console.log("write to json file called:\n" + jsonContent);

  userName = userName.substring(1,userName.length-1);
  var userFolder = userName;  
  console.log("user folder: "+userFolder);
  createFolder(userFolder);
  
  fs.writeFile(__dirname + '/users/' + userFolder + '/profiles/' + fileName, jsonContent, function (err) {
    if (err) {
      res.send("Failed to save: Profile " + fileName + " could not be saved.");
      return console.log(err);
    }
    res.send("Profile " + fileName + " was successfuly saved.");
    console.log("The file was saved!");
  });
}

function createFolder(folderName){
  folderName = "user_"+folderName;
  console.log("folder name: "+folderName);
  try {
    fs.mkdirSync('/users/'+folderName);
    fs.mkdirSync('/users/'+folderName+'/profiles');
  } catch (err) {
    if (err.code !== 'EEXIST') throw err
  }

}




