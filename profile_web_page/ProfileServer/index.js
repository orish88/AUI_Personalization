

// import { error } from 'util';


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
var cors = require('cors');
const {OAuth2Client} = require('google-auth-library');
const CLIENT_ID = "401836963571-s3lm5t8mlrc5ta3r148djuhndagpfnh1.apps.googleusercontent.com";
const client = new OAuth2Client(CLIENT_ID);
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

app.post('/save_profile',(req,res)=>{

  console.log("token id received--req2:\n","-body-: "+req.body);
  // res.send("token id received :) ");

  let body = [];
  req.on('data', (chunk) => {
    body.push(chunk);
  }).on('end', async () => {
    body = Buffer.concat(body).toString();
    // at this point, `body` has the entire request body stored in it as a string
    console.log("body: ");
    var obj = JSON.parse(body);

    var userInfo = await verify(obj.id_token).catch(console.error);
    console.log("user info- id:" +userInfo.userId);

    
    writeToJsonProfile(userInfo.userId,obj.fileName, obj.jsonContent, res);
         
  });

});

function _addUserPrefix(userId){
  if(!userId.startsWith("user_")){
    return "user_"+userId;
  }
  return userId;
}

async function verify(token) {
  const ticket = await client.verifyIdToken({
      idToken: token,
      audience: CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
      // Or, if multiple clients access the backend:
      //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
  });
  const payload = ticket.getPayload();
  const userId = payload['sub'];
  // If request specified a G Suite domain:
  //const domain = payload['hd'];
  console.log("payload: ",payload);
  console.log("userid: ",userId);
  return {userId,payload};
}
  
// app.post('/users/:user_name/profiles/:profile_json_name', (req, res) => {
//   //"user1","test_profile7.json"

//   // response.send("respone string");
//   console.log("post request req: " + req);
//   console.log(req.params);
//   var userName = req.params.user_name;
//   var fileName = req.params.profile_json_name;

//   let body = [];
//   req.on('data', (chunk) => {
//     body.push(chunk);
//   }).on('end', () => {
//     body = Buffer.concat(body).toString();
//     // at this point, `body` has the entire request body stored in it as a string
//     writeToJsonProfile(userName, fileName, body, res);
//   });

//   // res.send({"jsonFile":jsonFile});


//   // readProfile(request,response);  
// });


function readJsonProfile(userName, fileName) {
  // userName = userName.substring(1,userName.length-1);
  // createFolder(userName);
  var path = __dirname + '\\users\\' + userName + '\\profiles\\' + fileName;
  try{
  var content = fs.readFileSync(path);
  var jsonObj = JSON.parse(content);
  console.log("json Obj keys: " + Object.keys(jsonObj));
  }catch(err){
    console.log("failed to read file: "+path);
    createFolder(userName);
    return "error: "+err;
    //case file does not exist:


  }
  return jsonObj;
}

function writeToJsonProfile(userName, fileName, jsonContent, res) {
  console.log("write to json file called:\n" + jsonContent);

  // userName = userName.substring(1,userName.length-1);
  
  var userFolder = _addUserPrefix(userName);
  console.log("user folder: "+userFolder);
  createFolder(userFolder);
  
  fs.writeFile(__dirname + '\\users\\' + userFolder + '\\profiles\\' + fileName, jsonContent, function (err) {
    if (err) {
      res.send("Failed to save: Profile " + fileName + " could not be saved.");
      return console.log(err);
    }
    res.send("Profile " + fileName + " was successfuly saved.");
    console.log("The file was saved!");
  });
}

function createFolder(folderName){
  folderName = _addUserPrefix(folderName);
  console.log("folder name: "+folderName);
  try {
    fs.mkdirSync(__dirname+'\\users\\'+folderName);
    fs.mkdirSync(__dirname+'\\users\\'+folderName+'\\profiles');
  } catch (err) {
    if (err.code !== 'EEXIST') throw err
  }

}


/**
 * Get a list of the template file names.
 * under templateList
 */
app.get('/Templates',(req,res)=>{
  
  
    console.log("get templates called");  
    fs.readdir('./Templates/', (err, files) => {
      files.forEach(file => { 
        console.log(file);
      });
      if(err){
        res.send({templateList:["error: "+err]});
        return;
      }
      res.send({templateList:files});
    })
  });

//TEMPLATES:

/**
 * Get a list of the template file names.
 * under templateList
 */
app.get('/users/:user_name/profiles/',(req,res)=>{

  console.log("profiles files reuqest:");
  fs.readdir('./users/'+req.params.user_name+'/profiles/', (err, files) => {
    if(files == undefined){
      return;
    }
    files.forEach(file => {
      console.log(file);
    });
    if(err){
      res.send({fileList:["error: "+err]});
      return;
    }
    res.send({fileList:files});
  })
});


/**
 * Get a template json file.
 */
app.get('/Templates/:template_json_name', (req, res) => {

  console.log("templates: get request url: " + req.url);
  console.log(req.params);
  var fileName = req.params.template_json_name;
  var jsonFile = readTemplateFile(fileName);
  res.send(jsonFile);


  // readProfile(request,response);  
});

function readTemplateFile(fileName) {
  // userName = userName.substring(1,userName.length-1);
  // createFolder(userName);
  var path = __dirname + '\\Templates\\' + fileName ;
  try{
  var content = fs.readFileSync(path);
  var jsonObj = JSON.parse(content);
  console.log("json Obj keys: " + Object.keys(jsonObj));
  }catch(err){
    console.log("failed to read file: "+path);
    createFolder(userName);
    return "error: "+err;
    //case file does not exist:


  }
  return jsonObj;
}



