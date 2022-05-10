# Command-line

Here is a list of my custom scrips, commands and procedures, related to the app deployment.

## Reverse proxy for the app

```bash
sudo a2proxy 'bballs' '48001'
```

```bash
sudo a2proxy 'bballs' remove
```

## Docker container for the app

```bash
# docker run -p '48001':'48001' 'bballs' -d
```

```bash
docker-compose up -d
```

```bash
docker-compose down
```

```bash
docker-prune.sh
```

## [PM2](https://www.npmjs.com/package/pm2) service for the app

```bash
cd app/
npm install
```

```bash
pm2 start 'npm run watch' --name 'bballs'
pm2 save
```

```bash
pm2 start 'npm start' --name 'bballs'
pm2 save
```

```bash
pm2 stop 'bballs'
pm2 delete 'bballs'
pm2 save
```
