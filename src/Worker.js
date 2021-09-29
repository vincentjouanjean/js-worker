self.onmessage = e => {
    var i = 0;
    self.postMessage({position: e.data.position, dataBuffer: e.data.dataBuffer.map((data) => {
       if (e.data.throttleDown) {
            // if the throttle down is activated, wait 2ms every throttleDownNumber elements 
            i++;
            if (i % e.data.throttleDownNumber === 0) {
                var now = new Date().getTime();
                while(new Date().getTime() < now + 2) {}
            }
        }
        // Calculation
        return Math.exp(Math.log(data + 1) + 3) * 8 / 154;
    })});
};

