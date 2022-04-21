# Sources

* https://mixkit.co/free-sound-effects/game/

* https://www.storyblocks.com/video/search/very+80s

* https://samplefocus.com/samples?utf8=%E2%9C%93&search=game+voice

# Commands
[**Changing (reducing) the quality of an ogg file?**](https://askubuntu.com/questions/1118939/changing-reducing-the-quality-of-an-ogg-file)

```bash
ffmpeg -i Sugar.mp3 -c:a libopus -b:a 16k -ar 16000 -ac 1 -application voip Sugar.ogg
```

```bash
ffmpeg -y -loglevel "error" -t 30 -i Garbage\ -07-\ Push\ It.mp3 -acodec libmp3lame  -ab 88k garbage-version.2.0-push.it.mp3
```

```bash
ffmpeg -i in.mp3 -af "volume=0.25" out.mp3
```
