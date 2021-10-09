import Worker from "worker-loader!./Worker.js";

document.body.appendChild(component());

let executionDate;
let data = [];
// Adds in an array, the elements received by packet 
let dataTmp = [];
let currentExec = 1;
let workers = [];

// Selectors
const nbWorkersInput = document.getElementById('nb_workers');
const nbElementsInput = document.getElementById('nb_elements');
const nbPacketsInput = document.getElementById('nb_packets');
const nbExecutionsInput = document.getElementById("nb_executions");
const throttleDownInput = document.getElementById("throttle_down");
const executionTimeInput = document.getElementById('executions_time');
const counterPacketsInput = document.getElementById('counter_packets');
const totalPacketsInput = document.getElementById('total_packets');

function component() {
  const element = document.createElement('div'); 
  element.innerHTML = ` <div><button onclick=window.runWithWorker()>RUN WITH WORKER</button></div>
                        <div><button onclick=window.runWithoutWorker()>RUN WITHOUT WORKER</button></div>
                        <div><button onclick=window.cleanExecutionTime()>CLEAN</button></div>
                        <div>Number of workers : <input id="nb_workers" "type="number" value="10""></input></div>
                        <div>Number of elements : <input id="nb_elements" "type="number" value="100""></input></div>
                        <div>Number of packets<input id="nb_packets" "type="number" value="1""></input></div>
                        <div>Number of executions<input id="nb_executions" "type="number" value="1""></input></div>
                        <div>Throttle down<input id="throttle_down" type="checkbox"></input></div>
                        <div id="executions_time"><div>Execution time :</div></div>
                        <div id="svg">
                            <svg width="400" height="120" viewBox="0 0 480 120" xmlns="http://www.w3.org/2000/svg">
                              <!-- Draw the outline of the motion path in grey -->
                              <path d="M10,110 A120,120 -45 0,1 110 10 A120,120 -45 0,1 10,110" stroke="lightgrey" stroke-width="2" fill="none" id="theMotionPath"/>

                              <!-- Red arrow which will not rotate -->
                              <path fill="red" d="M-5,-5 L10,0 -5,5 0,0 Z">
                                <animateMotion dur="30s" repeatCount="indefinite" rotate="0">
                                  <mpath href="#theMotionPath"/>
                                </animateMotion>
                              </path>
                              </g>
                            </svg>
                        </div>
                        <div>Counter : <span id="counter_packets"></span>/<span id="total_packets"></span></div>
                        `;
  return element;
}

function receiveFromWorker(e) {
    dataTmp[e.data.position] = Array.from(e.data.dataBuffer);
    counterPacketsInput.innerHTML = dataTmp.length;
    if (e.data.position + 1 >= nbPacketsInput.value) {
        while (dataTmp.length < nbPacketsInput.value) {
            // Wait previous packets
        }
        // Get all data
        data = dataTmp.flatMap(x => x);

        // Print log
        printLog(true);

        // Run another processing 
        currentExec++;
        if (currentExec < nbExecutionsInput.value) {
            runWithWorker();
        } else {
          currentExec = 1;
        }
    }
}

function runWithoutWorker() {
    clearVariables();
    for (let i = 0; i < nbElementsInput.value; i++) {
        // Calculation
        data.push(Math.exp(Math.log(i + 1) + 3) * 8 / 154);
    }
    printLog(false);
}

function runWithWorker() {
    clearVariables();
    for (let i = 0; i < nbWorkersInput.value; i++) {
        workers[i] = new Worker();
        workers[i].onmessage = receiveFromWorker;
    }
    totalPacketsInput.innerHTML = nbPacketsInput.value;
    for (let i = 0; i < nbPacketsInput.value; i++) {
        let values = range((nbElementsInput.value / nbPacketsInput.value).toFixed(0) * i + 1, nbElementsInput.value / nbPacketsInput.value * (i+1), 1);
        let buffer = new Uint16Array(values);
        let randomWorker = Math.floor(Math.random() * nbWorkersInput.value);
        workers[randomWorker].postMessage({position: i, throttleDown: throttleDownInput.checked, throttleDownNumber: (3333).toFixed(0), dataBuffer: buffer}, [buffer.buffer]);
    }
}

function printLog(worker) {
    let executionTime = Date.now() - executionDate;
    let newSpan = executionTimeInput.appendChild(document.createElement('div'));
    if (worker) {
        newSpan.innerHTML = `${currentExec} - Numbers of elements : ${nbElementsInput.value}, number of packets : ${nbPacketsInput.value}, execution time : ${executionTime + 'ms'}`;
    } else {
        newSpan.innerHTML = `${currentExec} - Numbers of elements : ${nbElementsInput.value}, execution time : ${executionTime + 'ms'}`;
    }
}

function cleanExecutionTime() {
  executionTimeInput.innerHTML = '';
}

function clearVariables() {
    for (let i = 0; i < workers.length; i++) {
        workers[i].terminate();
    }
    workers = [];
    dataTmp, data = [];
    executionDate = Date.now();
    counterPacketsInput.innerHTML = '';
    totalPacketsInput.innerHTML = '';
}

function range(start, stop, step) {
    return Array.from({ length: (stop - start) / step + 1}, (_, i) => start + (i * step));
}

window.runWithWorker = runWithWorker;
window.runWithoutWorker = runWithoutWorker;
window.cleanExecutionTime = cleanExecutionTime;

