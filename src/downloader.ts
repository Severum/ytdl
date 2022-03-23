import * as fs from 'fs'
import { exec } from 'child_process'
import { ipcMain } from 'electron'
import ytdl from 'ytdl-core'

export function setupDownloader (){

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
      throw err
    }
  })

  ipcMain.on('dlUrl', (event, downloadItem) => {
    try {
      const downloadItemParse = JSON.parse(downloadItem)
      const video = ytdl(downloadItemParse.url)
      video.pipe(fs.createWriteStream(downloadItemParse.name+".mp4"))
      event.reply('dlUrl', true)
      video.on('progress', function(chunkLength: int, totalReceive: int, total: int) {
        event.reply('progressUrl'+downloadItemParse._id, Math.floor((totalReceive / total) * 100)) // percentage

        if (totalReceive == total) {
          exec(`ffmpeg -i \"${downloadItemParse.name+".mp4"}\" -f mp3 -ab 192000 -vn \"${downloadItemParse.downloadPath+downloadItemParse.name+".mp3"}\"`, (error, stdout, stderr) => {
            fs.unlinkSync(downloadItemParse.name+".mp4") // remove .mp4 file
            event.reply('endDl-'+downloadItemParse._id, true)
          })
          event.reply('endDl'+downloadItemParse._id, true)
        }
      })
    } catch(err) {
      event.reply('dlUrl', false)
      throw err
    }
  })
}
