
function createBar(x, y, width, height, color, canvas) {
    return {
        x,
        y,
        width,
        height,
        color,
        canvas,
        update(micInput) {
            this.height = micInput * 1000;
        },
        draw(context) {
            context.fillStyle = this.color;
            context.fillRect(this.x, this.y, this.width, this.height);
        }
    };
}

function createBars(canvas, barCount) {
    const bars = [];
    const barWidth = canvas.width / barCount;

    let hue = 270;
    const saturation = 100;
    const lightness = 50; 
    for (let i = 0; i < barCount; i++) {
        const stepHue = hue + (i * 1/35);
        const color = `hsl(${stepHue}, ${saturation}%, ${lightness}%)`;
        bars.push(createBar(i * barWidth, canvas.height / 2, 10, 10, color, canvas));
    }

    return bars;
}

function main() {
    const canvas = document.getElementById('myCanvas');
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;


    let bars = createBars(canvas, 256);

    let microphone = {
        initialized: false,
        audioContext: null,
        microphone: null,
        analyser: null,
        dataArray: null
    };

    function initializeMicrophone(callback) {
        navigator.mediaDevices.getUserMedia({ audio: true })
            .then(function (stream) {
                microphone.audioContext = new (window.AudioContext || window.webkitAudioContext)();
                microphone.microphone = microphone.audioContext.createMediaStreamSource(stream);
                microphone.analyser = microphone.audioContext.createAnalyser();
                microphone.analyser.fftSize = 512;
                const bufferLength = microphone.analyser.frequencyBinCount;
                microphone.dataArray = new Uint8Array(bufferLength);
                microphone.microphone.connect(microphone.analyser);
                microphone.initialized = true;
                console.log("Microphone initialized");
                if (typeof callback === 'function') {
                    callback(microphone);
                }
                return microphone
            })
            .catch(function (err) {
                alert(err);
            });
    }

    initializeMicrophone()

    function getSamples(microphone) {
        microphone.analyser.getByteTimeDomainData(microphone.dataArray);
        let normSamples = [...microphone.dataArray].map(e => e / 128 - 1);
        return normSamples;
    }

    function animate() {
        if (microphone.initialized){
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const samples = getSamples(microphone);
            bars.forEach(function (bar, i) {
                bar.update(samples[i]);
                bar.draw(ctx);
            });
        }
        requestAnimationFrame(animate);
    }

    animate();
}
