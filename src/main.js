const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const fileUpload = require('express-fileupload');
const extract = require('extract-zip')
const fs = require('fs');
const path = require('path');

const app = express();

app.use(helmet());
app.use(bodyParser.json());
app.use(cors());
app.use(morgan('combined'));

app.use(fileUpload({
  useTempFiles : true,
  tempFileDir : '/tmp/uploads'
}));

app.post('/upload', async function(req, res) {
  // Check uploaded file
  if (!req.files) {
    return res.status(400).send('No files were uploaded.');
  }
  if (req.files.project.mimetype !== 'application/zip') {
    return res.status(400).send('Only ZIP files are allowed.');
  }

  let body = req.body;

  // Get project details
  if (body.projectName === undefined || body.projectName === '') {
    return res.status(400).send('Project name is required.');
  }
  if (body.projectName.length > 50) {
    return res.status(400).send('Project name is too long.');
  }
  if (body.projectName.match(/[^a-zA-Z0-9_]/g)) {
    return res.status(400).send('Project name can only contain letters, numbers and underscores.');
  }
  const projectName = body.projectName;
  
  // Extract ZIP file
  let project = req.files.project;
  let projectOutputDir = '/tmp/uploads/' + project.tempFilePath.split('/')[3] + '-output/'

  if (!fs.existsSync(projectOutputDir))
    fs.mkdirSync(projectOutputDir);

  await extract(project.tempFilePath, {dir: projectOutputDir}, function (err) {
    if (err) {
      return res.status(400).send('Error while extracting ZIP file.');
    }
  });

  // Delete ZIP file
  fs.unlink(project.tempFilePath, function (err) {
    if (err) {
      return res.status(400).send('Error while deleting ZIP file.');
    }
  });

  // Get directories in project output directory
  let directories = fs.readdirSync(path.resolve(projectOutputDir), { withFileTypes: true })
                      .filter(dirent => dirent.isDirectory())
                      .map(dirent => dirent.name)
  
  projectOutputDir = path.resolve(projectOutputDir, directories[0]);
  console.log(projectOutputDir);

  // Build Docker Image
  
  // Delete output directory
  fs.rmdir(projectOutputDir, { recursive: true }, function (err) {
    if (err) {
      console.error('Error while deleting output directory:', err);
    }
  });

  res.send('File uploaded successfully!');
});

app.listen(3000, () => {
  console.log('extender service listening on port 3000');
});
