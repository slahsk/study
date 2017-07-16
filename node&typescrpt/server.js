var cluster = require('cluster');
var os = require('os');
const http = require('http');

const hostname = '127.0.0.1';


if (cluster.isMaster) {
    //CPU의 갯수만큼 워커 생성
    os.cpus().forEach(function (cpu) {
        cluster.fork();
    });

    //워커가 죽으면,
    cluster.on('exit', function(worker, code, signal) {

        //종료된 클러스터 로그
        console.log('워커 종료 : ' + worker.id);

        if (code == 200) {
            //종료 코드가 200인 경우, 워커 재생성
            cluster.fork();
        }
    });
}
else {
    //워커 로직을 여기에 작성
    const port = 3000 + cluster.worker.id;
    console.log('워커 생성 : ' + cluster.worker.id);
    console.log('port : ' + port);


    const server = http.createServer((req, res) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    res.end(`Hello World\n ${port}`);
    });

    server.listen(port, hostname, () => {
        console.log(`Server running at http://${hostname}:${port}/`);
    });
    
}