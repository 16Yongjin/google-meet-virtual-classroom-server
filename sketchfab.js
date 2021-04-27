const fs = require('fs')
const https = require('https')
const path = require('path')
const unzipper = require('unzipper')
const fetch = require('node-fetch')
const sketchfabToken = process.env.SKETCHFAB_API_KEY

console.log('sketchfabToken', sketchfabToken)

const getModelPath = (uid) => path.join(__dirname, `/models/${uid}`)

const fetchModelZipUrl = (uid) =>
  fetch(`https://api.sketchfab.com/v3/models/${uid}/download`, {
    headers: {
      Authorization: `Token ${sketchfabToken}`,
    },
  })
    .then((r) => r.json())
    .then((res) => res.gltf.url)

const existDir = async (path) => {
  try {
    await fs.promises.access(path)
    return true
  } catch {
    return false
  }
}

const download = (url, dest) =>
  new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest, { flags: 'wx' })

    const request = https.get(url, (response) => {
      if (response.statusCode === 200) {
        response.pipe(file)
      } else {
        file.close()
        fs.unlink(dest, () => {}) // Delete temp file
        reject(
          `Server responded with ${response.statusCode}: ${response.statusMessage}`
        )
      }
    })

    request.on('error', (err) => {
      file.close()
      fs.unlink(dest, () => {}) // Delete temp file
      reject(err.message)
    })

    file.on('finish', () => {
      file.close()
      resolve()
    })

    file.on('error', (err) => {
      file.close()

      if (err.code === 'EEXIST') {
        reject('File already exists')
      } else {
        fs.unlink(dest, () => {}) // Delete temp file
        reject(err.message)
      }
    })
  })

const unzip = (dest) =>
  new Promise((resolve, reject) => {
    fs.createReadStream(dest)
      .pipe(unzipper.Extract({ path: dest.replace(/\.zip$/, '') }))
      .on('error', reject)
      .on('finish', resolve)
  })

const deleteFile = fs.promises.unlink

const downloadSketchFab = async (uid) => {
  const dirPath = getModelPath(uid)
  const zipPath = getModelPath(uid + '.zip')
  if ((await existDir(zipPath)) || (await existDir(dirPath))) {
    console.log('existing!')
    return true
  }

  const zipUrl = await fetchModelZipUrl(uid)
  await download(zipUrl, zipPath)
  await unzip(zipPath)
  await deleteFile(zipPath)
}

module.exports = {
  downloadSketchFab,
}
