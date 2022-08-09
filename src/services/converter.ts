const fs = require('fs');
const path = require('path');
const childProcess = require('child_process');

var ffmpegPath = path.resolve("./public/ffmpeg/bin/ffmpeg.exe");

export async function convert (mp4Name: string, mp3Name: string){
    childProcess.execFile(ffmpegPath, ['-i', mp4Name, '-f', 'mp3', mp3Name], (err: Error, stdout: String, stderr: String) => {
        if (err)
            throw err;
        
        console.log("Convert success !");
        fs.unlink(mp4Name, (err: Error) => {
            if (err)
                throw err;
            
        
            console.log(mp4Name + " is deleted.");
        });
    })
}