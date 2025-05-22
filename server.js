const express = require('express');
const { YoutubeTranscript } = require('youtube-transcript');
const app = express();
const port = 3000; // 우리 프로그램이 사용할 통신 채널 번호

// 다른 웹사이트(우리 index.html)가 우리 프로그램에게 말을 걸 수 있도록 허락해주는 설정
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*'); // 지금은 모든 사이트 허용 (나중에 바꿀 수 있어요)
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

// "안녕! 유튜브 주소 줄 테니 대본 좀 찾아줘" 라는 요청을 처리하는 부분
app.get('/api/transcript', async (req, res) => {
    const videoUrl = req.query.url; // 사용자가 보내준 유튜브 주소

    if (!videoUrl) {
        // 유튜브 주소가 안 왔으면, "주소가 필요해!" 라고 알려주기
        return res.status(400).json({ error: 'YouTube URL is required.' });
    }

    try {
        // 유튜브에서 대본을 가져오려고 시도!
        const transcriptResponse = await YoutubeTranscript.fetchTranscript(videoUrl);
        // 대본이 여러 조각으로 오면, 하나의 긴 글로 합치기
        const fullTranscript = transcriptResponse.map(item => item.text).join('\n');
        // 성공! 합쳐진 대본을 보내주기
        res.json({ transcript: fullTranscript });
    } catch (error) {
        // 이런! 대본 가져오다가 문제가 생겼을 때
        console.error('Error fetching transcript:', error.message); // 어떤 문제인지 기록해두기
        if (error.message.includes('transcripts disabled') || error.message.includes('No transcripts found')) {
            // "이 영상은 대본이 없거나 막혀있어!" 라고 알려주기
            res.status(404).json({ error: '해당 영상의 대본을 찾을 수 없거나 비활성화되어 있습니다.' });
        } else {
            // 다른 종류의 문제면, "문제가 생겨서 못 가져왔어!" 라고 알려주기
            res.status(500).json({ error: '대본을 가져오는 중 오류가 발생했습니다.' });
        }
    }
});

// 우리 프로그램을 컴퓨터에서 실행시키는 명령
app.listen(port, () => {
    console.log(`유튜브 대본 프로그램이 컴퓨터의 ${port}번 채널에서 듣고 있어요.`);
    console.log(`이렇게 요청하세요: http://localhost:${port}/api/transcript?url=여기에유튜브주소`);
});