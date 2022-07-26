import * as fs from 'fs'
import { ipcMain } from 'electron'
import ytdl from 'ytdl-core'
import { convert } from './converter'

export function initDownloader() {

  ipcMain.on('infoUrl', async (event, downloadItem) => {
    try {
      const ytRes = await ytdl.getInfo(JSON.parse(downloadItem).url)
      const ytInfo = {
        name: ytRes.player_response.videoDetails.title,
        thumbnail: ytRes.player_response.videoDetails.thumbnail.thumbnails[0].url
      }
      if (ytRes) {
        event.reply('infoUrl', ytInfo)
      } else {
        event.reply('infoUrl', false)
      }
      return
    } catch (err) {
      event.reply('infoUrl', false)
      throw err
    }
  })

  ipcMain.on('dlUrl', (event, downloadItem) => {
    try {
      const downloadItemParse = JSON.parse(downloadItem)
      const video = ytdl(downloadItemParse.url)
      video.pipe(fs.createWriteStream(downloadItemParse.name+".mp4"))
      event.reply('dlUrl', true)
      video.on('progress', function(chunkLength, totalReceive, total) {
        event.reply('progressUrl'+downloadItemParse._id, Math.floor((totalReceive / total) * 100)) // percentage

        if (totalReceive == total) {
          convert("./" + downloadItemParse.name + ".mp4", downloadItemParse.downloadPath + "/" + downloadItemParse.name + ".mp3");
          event.reply('endDl'+downloadItemParse._id, true)
        }
      })
    } catch(err) {
      event.reply('dlUrl', false)
      throw err
    }
  })
}
