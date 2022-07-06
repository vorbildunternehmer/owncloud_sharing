const axios = require('axios')
const { createClient } = require("webdav");
const result = {}
const btoa = require('btoa')

const url = process.env.CLOUDDIR

const settings = {
  url: "/dav/files/" + process.env.USER +  url,
  credentials: {
      username: process.env.USER,
      password: process.env.PASSWORD
  }
}

async function getData () {

  const client = createClient(
      process.env.SERVER + "/remote.php",
      settings.credentials
  );

  const directoryItems = await client.getDirectoryContents(settings.url);

  handleJSON(directoryItems)

}

function handleJSON (data) {
  const href = []
  data.forEach(function (d) {
    if (typeof d['mime'] !== 'undefined' && d['mime'].includes('image')) {
      href.push(d['basename'])
    }
  })
  createSharingLink(href)
}

async function createSharingLink (data) {
  console.log(url + ':')
  data.forEach(async function (d) {
    const temp = await axiosSharingLink(d)
    result[temp] = ''
    console.log( Math.round((Object.keys(result).length / data.length) * 100) + '%' )
    if (Object.keys(result).length === data.length) {
      console.log(JSON.stringify(result))
    }
  })
}

async function axiosSharingLink (ret) {

  const sendSettings = {
    url: process.env.SERVER + "/ocs/v1.php/apps/files_sharing/api/v1/shares",
    method: "post",
    data: {
      path: url + '/' + ret,
      shareType: 3,
      permissions: 3,
      name: ret,
      format: "json"
    },
    headers:
      {
        Authorization: 'Basic ' + btoa( settings.credentials.username + ':' + settings.credentials.password)
      }
  }
  const data = await axios(sendSettings)

  return data.data.ocs.data.url + '/download'

}

getData()
