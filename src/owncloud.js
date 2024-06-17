const axios = require('axios');
const { createClient } = require('webdav');
const btoa = require('btoa');

let url;

const settings = {
  credentials: {
    username: process.env.USER,
    password: process.env.PASSWORD,
  },
};

async function getData(_url) {
  url = _url;
  settings.url = '/dav/files/' + process.env.USER + url;

  const client = createClient(
    process.env.SERVER + '/remote.php',
    settings.credentials
  );
  try {
    const directoryItems = await client.getDirectoryContents(settings.url);
    return await handleJSON(directoryItems);
  } catch (error) {
    console.error('Error getting directory contents:', error);
    throw error;

  }
}

async function handleJSON(data) {
  const href = data
    .filter(
      (d) => typeof d['mime'] !== 'undefined' && d['mime'].includes('image')
    )
    .map((d) => d['basename']);

  try {
    return await createSharingLink(href);
  } catch (error) {
    console.error('Error creating sharing link:', error);
    throw error;
  }
}

async function createSharingLink(data) {
  const result = {};

  const promises = data.map(async (d) => {
    try {
      const temp = await axiosSharingLink(d);
      result[temp] = '';
      console.log(
        Math.round((Object.keys(result).length / data.length) * 100) + '%'
      );
      return temp;
    } catch (error) {
      console.error('Error creating sharing link for', d, ':', error);
      throw error;
    }
  });

  await Promise.all(promises);
  console.log(JSON.stringify(result));
  return JSON.stringify(result);
}

async function axiosSharingLink(ret) {
  const sendSettings = {
    url: process.env.SERVER + '/ocs/v1.php/apps/files_sharing/api/v1/shares',
    method: 'post',
    data: {
      path: url + '/' + ret,
      shareType: 3,
      permissions: 3,
      name: ret,
      format: 'json',
    },
    headers: {
      Authorization:
        'Basic ' +
        btoa(
          settings.credentials.username + ':' + settings.credentials.password
        ),
    },
  };

  try {
    const { data } = await axios(sendSettings);
    return data.ocs.data.url + '/download';
  } catch (error) {
    console.error('Error in axiosSharingLink:', error);
    throw error;
  }
}

module.exports = { getData };
