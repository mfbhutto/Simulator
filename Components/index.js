function fact(num) {
    if (num < 0) {
        return -1;
    }
    else if (num == 0) {
        return 1;
    }
    else {
        let result = 1;
        for (var i = num; i > 1; i--) {
            result *= i;
        };
        return result;
    }
};

function cpCalc(arrivalMean) {
    let cplookup = 0;
    let cp = 0;
    let count = 0;
    let cparray = [];
    let cplookuparray = [];


    while (cp < 1) {
        let calc = Math.pow(2.71828, -arrivalMean);
        calc = calc * Math.pow(arrivalMean, count);
        calc = calc / fact(count)


        cplookup = cp;
        cplookuparray[count] = cplookup;


        cp = calc + cplookup;
        cparray[count] = cp
        //    console.log(cp+'\n'+count)
        count = count + 1

    }
    let array = [cparray, cplookuparray]
    return array

}
function normalCDF(x) {
    const t = 1 / (1 + 0.2316419 * Math.abs(x));
    const d = 0.3989423 * Math.exp(-x * x / 2);
    const c1 = 0.31938153;
    const c2 = -0.356563782;
    const c3 = 1.781477937;
    const c4 = -1.821255978;
    const c5 = 1.330274429;
    let probability = 1 - d * (c1 * t + c2 * t * t + c3 * t * t * t + c4 * t * t * t * t + c5 * t * t * t * t * t);

    if (x < 0) {
        probability = 1 - probability;
    }

    return probability;
}

function cpCalcUniform(mean, variance) {
    let cplookup = 0;
    let cp = 0;
    let count = 0;

    let cparray = [];
    let cplookuparray = [];
    cplookuparray[0] = 0

    while (cp < 1) {
        cp = normalCDF(count, mean, variance)


        cparray[count] = cp
        count = count + 1
        cplookup = cparray[count - 1];
        cplookuparray[count] = cplookup;

    }
    let array = [cparray, cplookuparray]
    return array



}


function Addvalues() {
    var queuingModel = document.getElementById("queuing-model").value;

    // Sections for different models
    var mmnSection = document.querySelector('.mmn');
    var mgnSection = document.querySelector('.mgn');
    var ggnSection = document.querySelector('.ggn');
    var calcButton = document.querySelector('.form-button')

    // Hide all by default
    mmnSection.style.display = "none";
    mgnSection.style.display = "none";
    ggnSection.style.display = "none";

    // Show relevant section based on model
    if (queuingModel === "M/M/1" || queuingModel === "M/M/2") {
        mmnSection.style.display = "block";
        document.querySelector(".form-container").style.margin = "0 auto";
        document.querySelector(".form-container").style.margin = "0 auto";
        calcButton.style.display = "block";
    } else if (queuingModel === "M/G/1" || queuingModel === "M/G/2") {
        mgnSection.style.display = "block";
        calcButton.style.display = "block";
        document.querySelector(".form-container").style.margin = "0 auto";
    } else if (queuingModel === "G/G/1" || queuingModel === "G/G/2") {
        ggnSection.style.display = "block";
        calcButton.style.display = "block";
        document.querySelector(".form-container").style.margin = "0 auto";
    }
}



// -------------------------------------- M / M / 1 MODEL  ---------------------------------------------- // 
function generate_MM1_Table() {
    var arrivalMean = parseFloat(document.getElementById("mean-arrival").value);
    var queuingModel = document.getElementById("queuing-model").value;
    var serviceMean = parseFloat(document.getElementById("mean-service").value);

    let interarrival = [];
    let arraymain = cpCalc(arrivalMean);
    let cparray = arraymain[0];
    let cplookuparray = arraymain[1];

    interarrival[0] = 0;
    for (let i = 1; i < cparray.length; i++) {
        let random = Math.random();
        if (random == 0) random += 0.1;
        for (let j = 0; j < cplookuparray.length; j++) {
            if (random > cplookuparray[j] && random < cparray[j]) {
                interarrival[i] = j + 1;
            }
        }
    }

    let currentTime = 0;
    let arrivalarray = [];
    let servicearray = [];
    let starttime = [];
    let endtime = [];
    let turnaround = [];
    let waittime = [];
    let response = [];

    for (let i = 0; i < cparray.length; i++) {
        currentTime += interarrival[i];
        arrivalarray[i] = currentTime;
        let service = exponentialRandom(serviceMean);
        servicearray[i] = service < 1 ? 1 : roundOff(service);
    }

    let Ganttchart = [];
    let check = 0;
    let index = 0;

    for (let k = 0; index < cparray.length; k++) {
        if (arrivalarray[index] == check) {
            Ganttchart[k] = [check, check + servicearray[index], index + 1];
            starttime[index] = check;
            endtime[index] = check + servicearray[index];
            check += servicearray[index];
            index++;
        } else if (arrivalarray[index] > check) {
            Ganttchart[k] = [check, arrivalarray[index], 0]; // idle
            check = arrivalarray[index];
        } else {
            Ganttchart[k] = [check, check + servicearray[index], index + 1];
            starttime[index] = check;
            endtime[index] = check + servicearray[index];
            check += servicearray[index];
            index++;
        }
    }

    // Render Gantt chart
    const ganttContainer = document.getElementById("gantt-chart");
    ganttContainer.innerHTML = "";

    Ganttchart.forEach(slot => {
        const [start, end, customer] = slot;
        const duration = end - start;

        const block = document.createElement("div");
        block.className = "gantt-block";
        block.style.width = `${duration * 10}px`; // adjust width for better visibility
        block.style.border = "1px solid black";
        block.style.padding = "5px";
        block.style.marginRight = "2px";
        block.style.textAlign = "center";
        block.style.position = "relative";
        block.style.backgroundColor = customer === 0 ? "#ddd" : "#8ef";
        block.innerText = customer === 0 ? "Idle" : `P${customer}`;

        // Start Time
        const startLabel = document.createElement("div");
        startLabel.className = "time-label";
        startLabel.style.position = "absolute";
        startLabel.style.left = "2px";
        startLabel.style.bottom = "-18px";
        startLabel.style.fontSize = "12px";
        startLabel.innerText = start;

        // End Time
        const endLabel = document.createElement("div");
        endLabel.className = "time-label";
        endLabel.style.position = "absolute";
        endLabel.style.right = "2px";
        endLabel.style.bottom = "-18px";
        endLabel.style.fontSize = "12px";
        endLabel.innerText = end;

        block.appendChild(startLabel);
        block.appendChild(endLabel);
        ganttContainer.appendChild(block);
    });

    // Clear previous table
    const table = document.getElementById("simulation_table");
    while (table.rows.length > 1) table.deleteRow(1);

    // Add table header styling
    const headerRow = table.rows[0];
    for (let i = 0; i < headerRow.cells.length; i++) {
        headerRow.cells[i].style.backgroundColor = '#f8f9fa';
        headerRow.cells[i].style.padding = '12px';
        headerRow.cells[i].style.textAlign = 'center';
        headerRow.cells[i].style.fontWeight = 'bold';
        headerRow.cells[i].style.borderBottom = '2px solid #dee2e6';
    }

    let totalTurnaround = 0;
    let totalWait = 0;
    let totalResponse = 0;
    let waitCount = 0;

    for (let i = 0; i < cparray.length; i++) {
        const turnaroundTime = endtime[i] - arrivalarray[i];
        const waitTime = starttime[i] - arrivalarray[i];
        const responseTime = waitTime;

        turnaround[i] = turnaroundTime;
        waittime[i] = waitTime;
        response[i] = responseTime;

        totalTurnaround += turnaroundTime;
        totalResponse += responseTime;
        if (waitTime !== 0) {
            totalWait += waitTime;
            waitCount++;
        }

        const row = table.insertRow();
        row.style.borderBottom = '1px solid #dee2e6';
        
        // Add cells with proper styling
        for (let j = 0; j < 13; j++) {
            const cell = row.insertCell(j);
            cell.style.padding = '8px';
            cell.style.textAlign = 'center';
            cell.style.borderRight = '1px solid #dee2e6';
        }

        row.cells[0].innerText = i + 1;
        row.cells[1].innerText = cplookuparray[i];
        row.cells[2].innerText = cparray[i];
        row.cells[3].innerText = i;
        row.cells[4].innerText = interarrival[i];
        row.cells[5].innerText = roundOff(arrivalarray[i]);
        row.cells[6].innerText = roundOff(servicearray[i]);
        row.cells[7].innerText = roundOff(starttime[i]);
        row.cells[8].innerText = roundOff(endtime[i]);
        row.cells[9].innerText = roundOff(turnaroundTime);
        row.cells[10].innerText = roundOff(waitTime);
        row.cells[11].innerText = roundOff(responseTime);
        row.cells[12].innerText = "Server 1";
    }

    const avgturnaround = totalTurnaround / cparray.length;
    const avgwait = waitCount === 0 ? 0 : totalWait / waitCount;
    const avgresponse = totalResponse / cparray.length;

    let idle = 0;
    for (let i = 0; i < Ganttchart.length; i++) {
        if (Ganttchart[i][2] === 0) idle += (Ganttchart[i][1] - Ganttchart[i][0]);
    }

    const totalTime = check;
    const serverutil = 1 - idle / totalTime;

    document.getElementById("server-utilization").innerHTML = serverutil.toFixed(2);
    document.getElementById("avg-turnaround").innerHTML = roundOff(avgturnaround);
    document.getElementById("avg-wait").innerHTML = roundOff(avgwait);
    document.getElementById("avg-response").innerHTML = roundOff(avgresponse);

    // ✅ Console logs
    console.log("Average Turnaround Time:", roundOff(avgturnaround));
    console.log("Average Waiting Time:", roundOff(avgwait));
    console.log("Average Response Time:", roundOff(avgresponse));
    console.log("Server Utilization:", serverutil.toFixed(2));

    // Create Bar Chart for Service Times
    const maxEndTime = Math.max(...endtime); // find max end time

    const ctx = document.getElementById('service-time-chart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: endtime.map((_, i) => `P${i + 1}`),
            datasets: [{
                label: 'End Time',
                data: endtime,
                backgroundColor: 'rgba(75, 192, 192, 0.6)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const i = context.dataIndex;
                            return [
                                `Start Time: ${starttime[i]}`,
                                `End Time: ${endtime[i]}`,
                                `Completion Time: ${endtime[i]}`,
                                `Burst Time: ${servicearray[i]}`,
                                `Wait Time: ${waittime[i]}`,
                                // `Response Time: ${response[i]}`,
                                `Turnaround Time: ${turnaround[i]}`
                            ];
                        }
                    }
                },
                legend: { display: false },
                title: {
                    display: true,
                    text: 'End Time Chart - Hover on each bar for full details'
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Processes'
                    }
                },
                y: {
                    beginAtZero: true,
                    max: maxEndTime + 10, // manually set upper limit
                    title: {
                        display: true,
                        text: 'End Time'
                    }
                }
            }
        }
    });
    
    

    // Helpers
    function exponentialRandom(mean) {
        return -Math.log(1 - Math.random()) * mean;
    }

    function roundOff(value) {
        return Math.round(value);
    }
}



// ------------------------------------ M / M / 2 MODEL  ---------------------------------------------- //

// ------------------------------------ M / M / 2 MODEL  ---------------------------------------------- //

function generate_MM2_Table() {
    const arrivalMean = parseFloat(document.getElementById('mean-arrival').value);
    const serviceMean = parseFloat(document.getElementById('mean-service').value);

    let cparray = [];
    let cplookuparray = [];
    let interarrival = [];

    let arraymain = cpCalc(arrivalMean);
    cparray = arraymain[0];
    cplookuparray = arraymain[1];

    interarrival[0] = 0;
    for (let i = 1; i < cparray.length; i++) {
        let random = Math.random();
        if (random === 0) random += 0.1;

        for (let j = 0; j < cplookuparray.length; j++) {
            if (random > cplookuparray[j] && random < cparray[j]) {
                interarrival[i] = j + 1;
            }
        }
    }

    let currentTime = 0;
    let arrivalarray = [], servicearray = [], starttime = [], endtime = [];
    let turnaround = [], waittime = [], server = [];

    for (let i = 0; i < cparray.length; i++) {
        currentTime += interarrival[i];
        arrivalarray[i] = currentTime;

        let service = exponentialRandom(serviceMean);
        servicearray[i] = Math.floor(service) === 0 ? Math.ceil(service) : roundOff(service);
    }

    const table = document.getElementById('simulation_table');
    while (table.rows.length > 1) {
        table.deleteRow(1);
    }

    // Clear Gantt chart sections
    document.getElementById("gantt-chart-server1").innerHTML = "";
    document.getElementById("gantt-chart-server2").innerHTML = "";

    let previousEndTimes = [0, 0];

    for (let i = 0; i < cparray.length; i++) {
        const seqNumber = i + 1;
        const cumlookup = cplookuparray[i];
        const cum = cparray[i];
        const avgArrival = i;
        const interArrivalRate = interarrival[i];
        currentTime = arrivalarray[i];
        const serviceTime = servicearray[i];

        // Determine which server is free
        let serverIndex = (previousEndTimes[0] <= currentTime && previousEndTimes[1] <= currentTime)
            ? 0
            : (previousEndTimes[1] < previousEndTimes[0] ? 1 : 0);

        const start = Math.max(currentTime, previousEndTimes[serverIndex]);
        const end = start + serviceTime;

        starttime[i] = roundOff(start);
        endtime[i] = roundOff(end);

        const turnaroundTime = end - currentTime;
        const waitTime = start > currentTime ? start - currentTime : 0;
        const responseTime = waitTime; // Changed to equal wait time

        turnaround[i] = turnaroundTime;
        waittime[i] = waitTime;
        server[i] = serverIndex + 1;

        previousEndTimes[serverIndex] = end;

        const row = table.insertRow();
        row.insertCell(0).innerText = seqNumber;
        row.insertCell(1).innerText = cumlookup;
        row.insertCell(2).innerText = cum;
        row.insertCell(3).innerText = avgArrival;
        row.insertCell(4).innerText = interArrivalRate;
        row.insertCell(5).innerText = roundOff(currentTime);
        row.insertCell(6).innerText = roundOff(serviceTime);
        row.insertCell(7).innerText = roundOff(start);
        row.insertCell(8).innerText = roundOff(end);
        row.insertCell(9).innerText = roundOff(turnaroundTime);
        row.insertCell(10).innerText = roundOff(waitTime);
        row.insertCell(11).innerText = roundOff(responseTime);
        row.insertCell(12).innerText = "Server " + (serverIndex + 1);

        // Gantt Chart Block Styling
        const ganttBlock = document.createElement("div");
        ganttBlock.className = "gantt-block";
        const duration = end - start;

        ganttBlock.style.width = `${duration * 10}px`;
        ganttBlock.style.border = "1px solid black";
        ganttBlock.style.padding = "5px";
        ganttBlock.style.marginRight = "2px";
        
        ganttBlock.style.position = "relative";
        ganttBlock.style.backgroundColor = serverIndex === 0 ? "#8ef" : "#E3FCF9";
        ganttBlock.innerText = `P${seqNumber}`;

        // Start Time Label
        const startLabel = document.createElement("div");
        startLabel.className = "time-label";
        startLabel.style.position = "absolute";
        startLabel.style.left = "2px";
        startLabel.style.bottom = "-18px";
        startLabel.style.fontSize = "12px";
        
        startLabel.innerText = roundOff(start);

        // End Time Label
        const endLabel = document.createElement("div");
        endLabel.className = "time-label";
        endLabel.style.position = "absolute";
        endLabel.style.right = "2px";
        endLabel.style.bottom = "-18px";
        endLabel.style.fontSize = "12px";
        endLabel.innerText = roundOff(end);

        ganttBlock.appendChild(startLabel);
        ganttBlock.appendChild(endLabel);

        if (serverIndex === 0) {
            document.getElementById("gantt-chart-server1").appendChild(ganttBlock);
        } else {
            document.getElementById("gantt-chart-server2").appendChild(ganttBlock);
        }
    }

    // Calculate averages
    let totalWait = 0, totalTurnaround = 0, totalService = 0, countWait = 0;
    for (let i = 0; i < cparray.length; i++) {
        totalTurnaround += turnaround[i];
        totalService += servicearray[i];
        if (waittime[i] !== 0) {
            totalWait += waittime[i];
            countWait++;
        }
    }

    const avgTurnaround = totalTurnaround / cparray.length;
    const avgWait = countWait === 0 ? 0 : totalWait / countWait;

    
    // Server utilization
    let serverutilization1 = [], serverutilization2 = [];
    for (let i = 0; i < server.length; i++) {
        if (server[i] === 1) serverutilization1.push(i);
        else serverutilization2.push(i);
    }

    function calculateUtilization(serverList, endTimeRef) {
        let idle = 0;
        for (let i = 0; i < serverList.length - 1; i++) {
            const gap = starttime[serverList[i + 1]] - endtime[serverList[i]];
            if (gap > 0) idle += gap;
        }
        return (endTimeRef - idle) / endTimeRef;
    }

    const serverUtil1 = calculateUtilization(serverutilization1, previousEndTimes[0]);
    const serverUtil2 = calculateUtilization(serverutilization2, previousEndTimes[1]);
  

    // Update Result Fields
    document.getElementById("utilization").innerHTML = 
        `<span><b>Server utilization 1</b>: ${serverUtil1.toFixed(2)}</span> &nbsp;
        <span><b>Server utilization 2</b>: ${serverUtil2.toFixed(2)}</span>`;
        console.log(`${serverUtil1.toFixed(2)}`)
    document.getElementById("turnaround").innerText = avgTurnaround.toFixed(2);
    document.getElementById("wait").innerText = avgWait.toFixed(2);
    document.getElementById("response").innerText = (avgWait + (totalService / cparray.length)).toFixed(2);
    console.log(avgTurnaround,avgWait)



    //BAR-CHART
    const maxEndTime = Math.max(...endtime); // find max end time

const ctx = document.getElementById('service-time-chart-mmc').getContext('2d');
new Chart(ctx, {
    type: 'bar',
    data: {
        labels: endtime.map((_, i) => `P${i + 1}`),
        datasets: [{
            label: 'End Time',
            data: endtime,
            backgroundColor: 'rgba(7, 85, 85, 0.6)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1
        }]
    },
    options: {
        responsive: true,
        plugins: {
            tooltip: {
                callbacks: {
                    label: function(context) {
                        const i = context.dataIndex;
                        return [
                            `Start Time: ${starttime[i]}`,
                            `End Time: ${endtime[i]}`,
                            `Completion Time: ${endtime[i]}`,
                            `Burst Time: ${servicearray[i]}`,
                            `Wait Time: ${waittime[i]}`,
                            // `Response Time: ${response[i]}`,
                            `Turnaround Time: ${turnaround[i]}`
                        ];
                    }
                }
            },
            legend: { display: false },
            title: {
                display: true,
                text: 'End Time Chart - Hover on each bar for full details'
            }
        },
        scales: {
            x: {
                title: {
                    display: true,
                    text: 'Processes'
                }
            },
            y: {
                beginAtZero: true,
                max: maxEndTime + 10, // manually set upper limit
                title: {
                    display: true,
                    text: 'End Time'
                }
            }
        }
    }
});

    // Helper functions
    function exponentialRandom(mean) {
        let value = -Math.log(1 - Math.random()) * mean;
        return value >= 0 ? value : 0;
    }

    function roundOff(value) {
        return Math.round(value);
    }
}









// ----------------------------------------- M / G / 1 MODEL  ---------------------------------------------- //

function generate_MG1_Table() {
    const arrivalMean = parseFloat(document.getElementById('mgn-arrival').value);
    const serviceMin = parseFloat(document.getElementById('mgn-service-min').value);
    const serviceMax = parseFloat(document.getElementById('mgn-service-max').value);

    let interarrival = [];
    let [cparray, cplookuparray] = cpCalc(arrivalMean);

    interarrival[0] = 0;
    for (let i = 1; i < cparray.length; i++) {
        let random = Math.random();
        for (let j = 0; j < cplookuparray.length; j++) {
            if (random > cplookuparray[j] && random < cparray[j]) {
                interarrival[i] = j + 1;
                break;
            }
        }
    }

    let arrivalarray = [], servicearray = [], starttime = [], endtime = [], turnaround = [], waittime = [];
    let currentTime = 0;
    let totalResponseTime = 0;
    let ganttData = [];

    for (let i = 0; i < cparray.length; i++) {
        currentTime += interarrival[i];
        arrivalarray[i] = currentTime;

        let service = uniformRandom(serviceMin, serviceMax);
        servicearray[i] = Math.round(service); // integer service time
    }

    const table = document.getElementById('simulation_table');
    while (table.rows.length > 1) table.deleteRow(1);

    let previousEndTime = 0;

    for (let i = 0; i < cparray.length; i++) {
        const seq = i + 1;
        const startTime = Math.max(arrivalarray[i], previousEndTime);
        const endTime = startTime + servicearray[i];
        const turnaroundTime = endTime - arrivalarray[i];
        const waitTime = startTime - arrivalarray[i];
        const responseTime = waitTime; // Changed to equal wait time

        starttime[i] = startTime;
        endtime[i] = endTime;
        turnaround[i] = turnaroundTime;
        waittime[i] = waitTime;
        totalResponseTime += responseTime;

        ganttData.push({ seqNumber: seq, startTime, endTime });

        const row = table.insertRow();
        row.insertCell(0).innerText = seq;
        row.insertCell(1).innerText = Math.round(cplookuparray[i] ?? 0);
        row.insertCell(2).innerText = Math.round(cparray[i] ?? 0);
        row.insertCell(3).innerText = i;
        row.insertCell(4).innerText = interarrival[i];
        row.insertCell(5).innerText = arrivalarray[i];
        row.insertCell(6).innerText = servicearray[i];
        row.insertCell(7).innerText = startTime;
        row.insertCell(8).innerText = endTime;
        row.insertCell(9).innerText = turnaroundTime;
        row.insertCell(10).innerText = waitTime;
        row.insertCell(11).innerText = responseTime;
        row.insertCell(12).innerText = "1";

        previousEndTime = endTime;
    }

    // Gantt Chart
    const ganttContainer = document.getElementById("mg1-gantt-chart");
    ganttContainer.innerHTML = "";

    const maxServiceTime = Math.max(...servicearray);

    ganttData.forEach(({ seqNumber, startTime, endTime }) => {
        const duration = endTime - startTime;
        const blockWidth = (duration / maxServiceTime) * 100;

        const block = document.createElement("div");
        block.className = "gantt-block";
        block.style.width = `${blockWidth}%`;
        block.style.border = "1px solid black";
        block.style.marginRight = "2px";
        block.style.textAlign = "center";
        block.style.position = "relative";
        block.style.backgroundColor = "#8ef";
        block.innerText = `P${seqNumber}`;

        const startLabel = document.createElement("div");
        startLabel.style.position = "absolute";
        startLabel.style.left = "2px";
        startLabel.style.bottom = "-18px";
        startLabel.style.fontSize = "12px";
        startLabel.innerText = Math.round(startTime);

        const endLabel = document.createElement("div");
        endLabel.style.position = "absolute";
        endLabel.style.right = "2px";
        endLabel.style.bottom = "-18px";
        endLabel.style.fontSize = "12px";
        endLabel.innerText = Math.round(endTime);

        block.appendChild(startLabel);
        block.appendChild(endLabel);
        ganttContainer.appendChild(block);
    });

    // Averages
    let totalTurnaround = turnaround.reduce((a, b) => a + b, 0);
    let totalWait = waittime.reduce((a, b) => a + b, 0);
    let avgTA = Math.round(totalTurnaround / cparray.length);
    let avgWT = Math.round(totalWait / cparray.length);
    let avgRT = Math.round(totalResponseTime / cparray.length);

    // Server Utilization
    let idleTime = 0;
    for (let i = 0; i < cparray.length - 1; i++) {
        if (endtime[i] < starttime[i + 1]) {
            idleTime += starttime[i + 1] - endtime[i];
        }
    }
    let totalTime = endtime[endtime.length - 1] - arrivalarray[0];
    let utilization = ((totalTime - idleTime) / totalTime).toFixed(2);

    document.getElementById("mg1-server-utilization").innerText = utilization;
    document.getElementById("mg1-avg-turnaround").innerText = avgTA;
    document.getElementById("mg1-avg-wait").innerText = avgWT;
    document.getElementById("mg1-avg-response").innerText = avgRT;

    const ctx = document.getElementById('service-time-chart-mg1').getContext('2d');
    if (window.mg1Chart) window.mg1Chart.destroy(); // clear previous chart
  
    window.mg1Chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: endtime.map((_, i) => `P${i + 1}`),
        datasets: [{
          label: 'End Time',
          data: endtime,
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        plugins: {
          tooltip: {
            callbacks: {
              label: function(context) {
                const i = context.dataIndex;
                return [
                  `Start Time: ${starttime[i]}`,
                  `End Time: ${endtime[i]}`,
                  `Completion Time: ${endtime[i]}`,
                  `Burst Time: ${servicearray[i]}`,
                  `Wait Time: ${waittime[i]}`,
                //   `Response Time: ${response[i]}`,
                  `Turnaround Time: ${turnaround[i]}`
                ];
              }
            }
          },
          legend: { display: false },
          title: {
            display: true,
            text: 'End Time Chart - Hover on each bar for full details'
          }
        },
        scales: {
          x: { title: { display: true, text: 'Processes' }},
          y: {
            beginAtZero: true,
            title: { display: true, text: 'End Time' }
          }
        }
      }
    });
  

    
  
    // Helpers
    function uniformRandom(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
}






// --------------------------------------- M/G/2 MODEL -------------------------------------------- // 

function generate_MG2_Table() {
    const arrivalMean = parseFloat(document.getElementById('mgn-arrival').value);
    const serviceMin = parseFloat(document.getElementById('mgn-service-min').value);
    const serviceMax = parseFloat(document.getElementById('mgn-service-max').value);
    const numServers = 2;

    let arraymain = cpCalc(arrivalMean);
    let cparray = arraymain[0];
    let cplookuparray = arraymain[1];

    let interarrival = [];
    interarrival[0] = 0;

    for (let i = 1; i < cparray.length; i++) {
        let random = Math.random();
        if (random === 0) random += 0.1;

        for (let j = 0; j < cplookuparray.length; j++) {
            if (random > cplookuparray[j] && random < cparray[j]) {
                interarrival[i] = j + 1;
            }
        }
    }

    let currentTime = 0;
    let arrivalarray = [];
    let servicearray = [];
    let starttime = [];
    let endtime = [];
    let turnaround = [];
    let waittime = [];
    let server = [];

    for (let i = 0; i < cparray.length; i++) {
        currentTime += interarrival[i];
        arrivalarray[i] = currentTime;
    }

    const table = document.getElementById('simulation_table');
    let previousEndTimes = new Array(numServers).fill(0);

    while (table.rows.length > 1) {
        table.deleteRow(1);
    }

    for (let i = 0; i < cparray.length; i++) {
        const seqNumber = i + 1;
        const cumlookup = cplookuparray[i] || 0;
        const cum = cparray[i] || 0;
        const interArrivalRate = interarrival[i] || 0;
        currentTime = arrivalarray[i];

        const serviceTime = uniformRandom(serviceMin, serviceMax);
        servicearray[i] = serviceTime;

        const startTimes = new Array(numServers);
        for (let s = 0; s < numServers; s++) {
            startTimes[s] = Math.max(currentTime, previousEndTimes[s]);
        }

        let serverIndex = 0;
        for (let s = 1; s < numServers; s++) {
            if (previousEndTimes[s] < previousEndTimes[serverIndex]) {
                serverIndex = s;
            }
        }

        const endTime = startTimes[serverIndex] + serviceTime;

        starttime[i] = startTimes[serverIndex];
        endtime[i] = endTime;
        turnaround[i] = endTime - currentTime;
        waittime[i] = startTimes[serverIndex] - currentTime;
        server[i] = serverIndex + 1;

        const responseTime = waittime[i];

        const row = table.insertRow();
        row.insertCell(0).innerText = seqNumber;
        row.insertCell(1).innerText = roundOff(cumlookup);
        row.insertCell(2).innerText = roundOff(cum);
        row.insertCell(3).innerText = i;
        row.insertCell(4).innerText = roundOff(interArrivalRate);
        row.insertCell(5).innerText = roundOff(currentTime);
        row.insertCell(6).innerText = roundOff(serviceTime);
        row.insertCell(7).innerText = roundOff(startTimes[serverIndex]);
        row.insertCell(8).innerText = roundOff(endTime);
        row.insertCell(9).innerText = roundOff(turnaround[i]);
        row.insertCell(10).innerText = roundOff(waittime[i]);
        row.insertCell(11).innerText = roundOff(responseTime);
        row.insertCell(12).innerText = "Server " + (serverIndex + 1);

        previousEndTimes[serverIndex] = endTime;
    }

    // Calculate averages
    let avgwait = 0;
    let countwait = 0;
    let avgturnaround = 0;

    for (let i = 0; i < cparray.length; i++) {
        avgturnaround += turnaround[i];
        if (waittime[i] != 0) {
            avgwait += waittime[i];
            countwait++;
        }
    }

    avgturnaround = avgturnaround / cparray.length;
    avgwait = countwait > 0 ? avgwait / countwait : 0;

    let serverutil1 = 0, serverutil2 = 0;
    let serverutilization1 = [], serverutilization2 = [];

    for (let i = 0; i < server.length; i++) {
        if (server[i] === 1) serverutilization1.push(i);
        else serverutilization2.push(i);
    }

    let idle = 0;
    for (let k = 0; k < serverutilization1.length - 1; k++) {
        if (starttime[serverutilization1[k + 1]] > endtime[serverutilization1[k]]) {
            idle += starttime[serverutilization1[k + 1]] - endtime[serverutilization1[k]];
        }
    }
    serverutil1 = (previousEndTimes[0] - idle) / previousEndTimes[0];

    idle = 0;
    for (let k = 0; k < serverutilization2.length - 1; k++) {
        if (starttime[serverutilization2[k + 1]] > endtime[serverutilization2[k]]) {
            idle += starttime[serverutilization2[k + 1]] - endtime[serverutilization2[k]];
        }
    }
    serverutil2 = (previousEndTimes[1] - idle) / previousEndTimes[1];

    const serverUtilization = document.getElementById("mg2-server-utilization");
    const avgTA = document.getElementById("mg2-avg-turnaround");
    const avgWT = document.getElementById("mg2-avg-wait");
    const avgRT = document.getElementById("mg2-avg-response");

    serverUtilization.innerHTML = `<span><b>Server Utilization 1</b>: ${serverutil1.toFixed(2)}</span> &nbsp; 
                                   <span><b>Server Utilization 2</b>: ${serverutil2.toFixed(2)}</span>`;
    avgTA.innerHTML = avgturnaround.toFixed(2);
    avgWT.innerHTML = avgwait.toFixed(2);
    avgRT.innerHTML = avgwait.toFixed(2); // Response time equals wait time

    // Helper functions
    function uniformRandom(min, max) {
        return Math.random() * (max - min) + min;
    }

    function roundOff(value) {
        return Math.round(value);
    }
}



// -------------------------------------------- G/G/1 MODEL ----------------------------------------- //

function generate_GG1_Table() {
    const avgInterarrival = parseFloat(document.getElementById('ggn-interarrival').value);
    const avgService = parseFloat(document.getElementById('ggn-service').value);
    const varArrival = parseFloat(document.getElementById('ggn-var-arrival').value);
    const varService = parseFloat(document.getElementById('ggn-var-service').value);
    
    const table = document.getElementById('simulation_table');
    let previousEndTime = 0;

    let arraymain = cpCalcUniform(avgInterarrival, varArrival);
    let cparray = arraymain[0];
    let cplookuparray = arraymain[1];

    let interarrival = [];
    interarrival[0] = 0;
    for (let i = 1; i < cparray.length; i++) {
        let random = Math.random();
        if (random === 0) {
            random += 0.1;
        } else {
            for (let j = 0; j < cplookuparray.length; j++) {
                if (random > cplookuparray[j] && random < cparray[j]) {
                    interarrival[i] = j + 1;
                }
            }
        }
    }

    let currentTime = 0;
    let arrivalarray = [];
    let starttime = [];
    let endtime = [];
    let turnaround = [];
    let waittime = [];
    let servicearray = []; // Define servicearray
    let responseTime = [];

    for (let i = 0; i < cparray.length; i++) {
        currentTime += interarrival[i];
        arrivalarray[i] = currentTime;
    }

    while (table.rows.length > 1) {
        table.deleteRow(1);
    }

    for (let i = 0; i < cparray.length; i++) {
        let serviceTime = 0;
        while (serviceTime <= 0 || serviceTime < 1) {
            serviceTime = generateRandomWithVariance(avgService, varService);
        }

        const seqNumber = i + 1;
        const startTime = Math.max(currentTime, previousEndTime);
        starttime[i] = roundOff(startTime);
        const endTime = startTime + serviceTime;
        endtime[i] = roundOff(endTime);
        const turnaroundTime = Math.max(endTime - currentTime);
        turnaround[i] = roundOff(turnaroundTime);
        const waitTime = Math.max(startTime - currentTime);
        waittime[i] = roundOff(waitTime);
        const responseTime = waitTime + serviceTime;

        const row = table.insertRow();
        row.insertCell(0).innerText = seqNumber;
        row.insertCell(1).innerText = cplookuparray[i];
        row.insertCell(2).innerText = cparray[i];
        row.insertCell(3).innerText = i;
        row.insertCell(4).innerText = interarrival[i];
        row.insertCell(5).innerText = roundOff(currentTime);
        row.insertCell(6).innerText = roundOff(serviceTime);
        row.insertCell(7).innerText = roundOff(startTime);
        row.insertCell(8).innerText = roundOff(endTime);
        row.insertCell(9).innerText = roundOff(turnaroundTime);
        row.insertCell(10).innerText = roundOff(waitTime);
        row.insertCell(11).innerText = roundOff(responseTime);
        row.insertCell(12).innerText = "Server " + 1;

        previousEndTime = endTime;
    }

    // Generate Gantt chart
   // Gantt Chart Generation (Styled Like MG1)
const ganttContainer = document.getElementById("gg1-gantt-chart");
ganttContainer.innerHTML = "";
ganttContainer.style.border="none"

// Find max service time for scaling
const maxServiceTime = Math.max(...endtime.map((e, i) => e - starttime[i]));

// Build Gantt blocks
for (let i = 0; i < starttime.length; i++) {
    const seqNumber = i + 1;
    const startTime = starttime[i];
    const endTime = endtime[i];
    const duration = endTime - startTime;
    const serviceTime = duration;

    const blockWidth = (serviceTime / maxServiceTime) * 100;

    const block = document.createElement("div");
    block.className = "gantt-block";
    block.style.width = `${blockWidth}%`;
    block.style.border = "1px solid black";
    block.style.marginRight = "2px";
    block.style.textAlign = "center";
    block.style.position = "relative";
    block.style.backgroundColor = "#8ef";
    block.innerText = `P${seqNumber}`;

    const startLabel = document.createElement("div");
    startLabel.style.position = "absolute";
    startLabel.style.left = "2px";
    startLabel.style.bottom = "-18px";
    startLabel.style.fontSize = "12px";
    startLabel.innerText = startTime;

    const endLabel = document.createElement("div");
    endLabel.style.position = "absolute";
    endLabel.style.right = "2px";
    endLabel.style.bottom = "-18px";
    endLabel.style.fontSize = "12px";
    endLabel.innerText = endTime;

    block.appendChild(startLabel);
    block.appendChild(endLabel);
    ganttContainer.appendChild(block);
}

    // Display results
    let avgWait = 0;
    let avgTurnaround = 0;
    let serverUtilization = 0;
    let idleServer = 0;

    for (let i = 0; i < cparray.length; i++) {
        avgTurnaround += turnaround[i];
        if (waittime[i] != 0) {
            avgWait += waittime[i];
        }
    }
    avgTurnaround = avgTurnaround / cparray.length;
    avgWait = avgWait / cparray.length;

    // Calculate server utilization
    for (let i = 0; i < cparray.length - 1; i++) {
        if (endtime[i] < starttime[i + 1]) {
            idleServer += (starttime[i + 1] - endtime[i]);
        }
    }
    let lastEndTime = endtime[cparray.length - 1];
    if (idleServer === 0) {
        serverUtilization = 1;
    } else {
        serverUtilization = idleServer / lastEndTime;
    }

    // Display metrics
    document.getElementById("gg1-server-utilization").innerHTML = serverUtilization;
    document.getElementById("gg1-turnaround").innerHTML = avgTurnaround;
    document.getElementById("gg1-avg-wait").innerHTML = avgWait;
    document.getElementById("gg1-avg-response").innerHTML = avgWait + avgTurnaround;

    const ctx = document.getElementById('service-time-chart-gg1').getContext('2d');
    if (window.mg1Chart) window.mg1Chart.destroy(); // clear previous chart
  
    window.mg1Chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: endtime.map((_, i) => `P${i + 1}`),
        datasets: [{
          label: 'End Time',
          data: endtime,
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        plugins: {
          tooltip: {
            callbacks: {
                label: function(context) {
                    const i = context.dataIndex;
                    return [
                        `Start Time: ${starttime[i]}`,
                        `End Time: ${endtime[i]}`,
                        `Completion Time: ${endtime[i]}`,
                        `Burst Time: ${endtime[i] - starttime[i]}`, // This is the service time
                        `Wait Time: ${waittime[i]}`,
                        // `Response Time: ${waittime[i] + endtime[i] - starttime[i]}`,,
                        `Turnaround Time: ${turnaround[i]}`
                    ];
                }
                
            }
          },
          legend: { display: false },
          title: {
            display: true,
            text: 'End Time Chart - Hover on each bar for full details'
          }
        },
        scales: {
          x: { title: { display: true, text: 'Processes' }},
          y: {
            beginAtZero: true,
            title: { display: true, text: 'End Time' }
          }
        }
      }
    });
  


}

function generateRandomWithVariance(mean, variance) {
    const stdDev = Math.sqrt(variance);
    const normalDist = generateStandardNormal();
    let value = mean + stdDev * normalDist;
    value = Math.max(0, value); // Ensure non-negative value
    return value;
}

function generateStandardNormal() {
    let u, v, s;
    do {
        u = Math.random() * 2 - 1;
        v = Math.random() * 2 - 1;
        s = u * u + v * v;
    } while (s >= 1 || s === 0);
    const multiplier = Math.sqrt(-2 * Math.log(s) / s);
    return u * multiplier;
}

function roundOff(value) {
    return Math.round(value);
}

// ----------------------------------------- G/G/2 MODEL -------------------------------------------- // 
function generate_GG2_Table() {
    const avgInterarrival = parseFloat(document.getElementById('ggn-interarrival').value);
    const avgService = parseFloat(document.getElementById('ggn-service').value);
    const varArrival = parseFloat(document.getElementById('ggn-var-arrival').value);
    const varService = parseFloat(document.getElementById('ggn-var-service').value);

    const numServers = 2;
    let arraymain = cpCalcUniform(avgInterarrival, varArrival);
    let cparray = arraymain[0];
    let cplookuparray = arraymain[1];

    let interarrival = [0];
    for (let i = 1; i < cparray.length; i++) {
        let random = Math.random();
        if (random === 0) random += 0.1;
        for (let j = 0; j < cplookuparray.length; j++) {
            if (random > cplookuparray[j] && random < cparray[j]) {
                interarrival[i] = j + 1;
            }
        }
    }

    let currentTime = 0;
    let arrivalarray = [];
    let starttime = [];
    let endtime = [];
    let turnaround = [];
    let waittime = [];
    let responseTimeArray = [];
    let server = [];

    const table = document.getElementById('simulation_table');
    while (table.rows.length > 1) table.deleteRow(1);

    let previousEndTimes = Array(numServers).fill(0);
    let totalBusyTime = Array(numServers).fill(0);

    for (let i = 0; i < cparray.length; i++) {
        let serviceTime = 0;
        while (serviceTime <= 0) {
            serviceTime = generateRandomWithVariance(avgService, varService);
        }

        currentTime += interarrival[i] || 0;
        arrivalarray[i] = roundOff(currentTime);

        // Select server with earliest end time
        let serverIndex = 0;
        for (let j = 1; j < numServers; j++) {
            if (previousEndTimes[j] < previousEndTimes[serverIndex]) {
                serverIndex = j;
            }
        }

        const start = Math.max(currentTime, previousEndTimes[serverIndex]);
        const end = start + serviceTime;

        starttime[i] = roundOff(start);
        endtime[i] = roundOff(end);
        turnaround[i] = roundOff(end - currentTime);
        waittime[i] = roundOff(start - currentTime);
        responseTimeArray[i] = waittime[i] + serviceTime;

        totalBusyTime[serverIndex] += serviceTime;
        previousEndTimes[serverIndex] = end;
        server[i] = serverIndex + 1;

        const row = table.insertRow();
        row.insertCell(0).innerText = i + 1;
        row.insertCell(1).innerText = cplookuparray[i];
        row.insertCell(2).innerText = cparray[i];
        row.insertCell(3).innerText = i;
        row.insertCell(4).innerText = interarrival[i];
        row.insertCell(5).innerText = arrivalarray[i];
        row.insertCell(6).innerText = roundOff(serviceTime);
        row.insertCell(7).innerText = roundOff(start);
        row.insertCell(8).innerText = roundOff(end);
        row.insertCell(9).innerText = roundOff(end - currentTime);
        row.insertCell(10).innerText = roundOff(start - currentTime);
        row.insertCell(11).innerText = roundOff(responseTimeArray[i]);
        row.insertCell(12).innerText = "Server " + (serverIndex + 1);
    }

    // Averages
    const avgTurnaround = turnaround.reduce((a, b) => a + b, 0) / turnaround.length;
    const avgWait = waittime.reduce((a, b) => a + b, 0) / waittime.length;
    const avgResponse = responseTimeArray.reduce((a, b) => a + b, 0) / responseTimeArray.length;

    // Gantt Chart
    let server1Bar = document.getElementById('gg2-gantt-chart-server1-p');
    let server2Bar = document.getElementById('gg2-gantt-chart-server2-p');
    let server1 = document.getElementById('gg2-gantt-chart-server1');
    let server2 = document.getElementById('gg2-gantt-chart-server2');
    server1.innerHTML = '';
    server2.innerHTML = '';

    server1Bar.innerHTML = `<h3>Gantt Chart - Server 1</h3><div class="gantt-bar" id="gg2-gantt-chart-server1" style="display: flex;"></div>`;
    server2Bar.innerHTML = `<h3>Gantt Chart - Server 2</h3><div class="gantt-bar" id="gg2-gantt-chart-server2" style="display: flex;"></div>`;

    for (let i = 0; i < cparray.length; i++) {
        const start = starttime[i];
        const end = endtime[i];
        const duration = end - start;
        const seqNumber = i + 1;
        const serverIndex = server[i] - 1;

        const ganttBlock = document.createElement("div");
        ganttBlock.className = "gantt-block";
        ganttBlock.style.width = `${duration * 10}px`;
        ganttBlock.style.minWidth = '60px';
        ganttBlock.style.maxWidth = '120px';
        ganttBlock.style.border = "1px solid black";
        ganttBlock.style.padding = "4px";
        ganttBlock.style.margin = "20px 2px";
        ganttBlock.style.position = "relative";
        ganttBlock.style.backgroundColor = serverIndex === 0 ? "#8ef" : "#E3FCF9";
        ganttBlock.style.fontSize = "12px";
        ganttBlock.style.textAlign = "center";
        ganttBlock.style.wordBreak = "break-word";
        ganttBlock.innerText = `P${seqNumber}`;

        const startLabel = document.createElement("div");
        startLabel.style.position = "absolute";
        startLabel.style.left = "2px";
        startLabel.style.bottom = "-18px";
        startLabel.style.fontSize = "11px";
        startLabel.innerText = roundOff(start);

        const endLabel = document.createElement("div");
        endLabel.style.position = "absolute";
        endLabel.style.right = "2px";
        endLabel.style.bottom = "-18px";
        endLabel.style.fontSize = "11px";
        endLabel.innerText = roundOff(end);

        ganttBlock.appendChild(startLabel);
        ganttBlock.appendChild(endLabel);

        if (serverIndex === 0) server1.appendChild(ganttBlock);
        else server2.appendChild(ganttBlock);
    }

    // Output Metrics
    const totalTime = Math.max(...endtime);
    const serverUtilization1 = (totalBusyTime[0] / totalTime).toFixed(2);
    const serverUtilization2 = (totalBusyTime[1] / totalTime).toFixed(2);

    document.getElementById("gg2-server-utilization").innerHTML = `<span><b>Server Utilization 1:</b> ${serverUtilization1}</span> &nbsp; <span><b>Server Utilization 2:</b> ${serverUtilization2}</span>`;
    document.getElementById("gg2-turnaround").innerText = roundOff(avgTurnaround);
    document.getElementById("gg2-avg-wait").innerText = roundOff(avgWait);
    document.getElementById("gg2-avg-response").innerText = roundOff(avgResponse);


    const ctx = document.getElementById('service-time-chart-gg2').getContext('2d');
    if (window.mg1Chart) window.mg1Chart.destroy(); // clear previous chart
  
    window.mg1Chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: endtime.map((_, i) => `P${i + 1}`),
        datasets: [{
          label: 'End Time',
          data: endtime,
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        plugins: {
          tooltip: {
            callbacks: {
                label: function(context) {
                    const i = context.dataIndex;
                    return [
                        `Start Time: ${starttime[i]}`,
                        `End Time: ${endtime[i]}`,
                        `Completion Time: ${endtime[i]}`,
                        `Burst Time: ${endtime[i] - starttime[i]}`, // This is the service time
                        `Wait Time: ${waittime[i]}`,
                        // `Response Time: ${waittime[i] + endtime[i] - starttime[i]}`,,
                        `Turnaround Time: ${turnaround[i]}`
                    ];
                }
                
            }
          },
          legend: { display: false },
          title: {
            display: true,
            text: 'End Time Chart - Hover on each bar for full details'
          }
        },
        scales: {
          x: { title: { display: true, text: 'Processes' }},
          y: {
            beginAtZero: true,
            title: { display: true, text: 'End Time' }
          }
        }
      }
    });
  



    
}



// Helper functions
function roundOff(value) {
    return Math.round(value);
}

function generateRandomWithVariance(mean, variance) {
    const stdDev = Math.sqrt(variance);
    const normalDist = generateStandardNormal();
    let value = mean + stdDev * normalDist;
    return Math.max(1, value); // Ensure non-zero value
}

function generateStandardNormal() {
    let u, v, s;
    do {
        u = Math.random() * 2 - 1;
        v = Math.random() * 2 - 1;
        s = u * u + v * v;
    } while (s >= 1 || s === 0);
    const multiplier = Math.sqrt(-2 * Math.log(s) / s);
    return u * multiplier;
}

// ------------------------------ Calculate Button  ------------------------------------------------ // 

function Calculate() {
    var queuingModel = document.getElementById("queuing-model").value;
    
    // Hide all sections first
    document.querySelector(".mm1-section").style.display = "none";
    document.querySelector(".mm2-section").style.display = "none";
    document.querySelector(".mg1-section").style.display = "none";
    document.querySelector(".mg2-section").style.display = "none";
    document.querySelector(".gg1-section").style.display = "none";
    document.querySelector(".gg2-section").style.display = "none";
    document.querySelector(".container-table").style.display = "none";

    if (queuingModel === "M/M/1") {
        generate_MM1_Table();
        document.querySelector(".mm1-section").style.display = "block";
        document.querySelector(".container-table").style.display = "block";
    }
    else if (queuingModel === "M/M/2") {
        generate_MM2_Table();
        document.querySelector(".mm2-section").style.display = "block";
        document.querySelector(".container-table").style.display = "block";
    }
    else if (queuingModel === "M/G/1") {
        generate_MG1_Table();
        document.querySelector(".mg1-section").style.display = "block";
        document.querySelector(".container-table").style.display = "block";
    }
    else if (queuingModel === "M/G/2") {
        generate_MG2_Table();
        document.querySelector(".mg2-section").style.display = "block";
        document.querySelector(".container-table").style.display = "block";
    }
    else if (queuingModel === "G/G/1") {
        generate_GG1_Table();
        document.querySelector(".gg1-section").style.display = "block";
        document.querySelector(".container-table").style.display = "block";
    }
    else if (queuingModel === "G/G/2") {
        generate_GG2_Table();
        document.querySelector(".gg2-section").style.display = "block";
        document.querySelector(".container-table").style.display = "block";
    }
}













document.addEventListener("DOMContentLoaded", function () {
    const tabButtons = document.querySelectorAll(".tab-button");
    const containers = {
      mm1: document.getElementById("mm1-container"),
      mmc: document.getElementById("mmc-container"),
      mg1: document.getElementById("mg1-container"),
      mgc: document.getElementById("mgc-container"),
      gg1: document.getElementById("gg1-container"),
      ggc: document.getElementById("ggc-container")
    };
  
    tabButtons.forEach((button) => {
      button.addEventListener("click", () => {
        tabButtons.forEach((btn) => btn.classList.remove("active"));
        button.classList.add("active");
  
        const target = button.getAttribute("data-tab");
  
        Object.keys(containers).forEach((key) => {
          containers[key].style.display = "none";
        });
  
        containers[target].style.display = "block";
      });
    });
  });
  
  // ------- M/M/1 Logic -------
  document.getElementById("mm1-form").addEventListener("submit", function (e) {
    e.preventDefault();
  
    const λ = parseFloat(document.getElementById("lemda").value);
    const μ = parseFloat(document.getElementById("mue").value);
  
    if (isNaN(λ) || isNaN(μ)) {
      alert("Please enter valid numbers.");
      return;
    }
  
    if (λ >= μ) {
      alert("The queue will tend to infinity as λ ≥ μ");
      return;
    }
  
    const ρ = λ / μ;
    const L = λ / (μ - λ);
    const Lq = (λ * λ) / (μ * (μ - λ));
    const W = 1 / (μ - λ);
    const Wq = λ / (μ * (μ - λ));
  
    const results = [
      { label: "L", desc: "Avg in System", color: "#6a1b9a", icon: "👥", value: L },
      { label: "Lq", desc: "Avg in Queue", color: "#0288d1", icon: "⏳", value: Lq },
      { label: "W", desc: "Avg Time in System", color: "#2e7d32", icon: "🕒", value: W },
      { label: "Wq", desc: "Avg Wait Time", color: "#c62828", icon: "📉", value: Wq },
      { label: "ρ", desc: "Utilization", color: "#ff8f00", icon: "⚙️", value: ρ },
    ];
  
    const grid = document.getElementById("mm1-results-grid");
    grid.innerHTML = "";
  
    results.forEach((item) => {
      const card = document.createElement("div");
      card.className = "metric-card";
  
      card.innerHTML = `
        <h3 style="color: ${item.color}">${item.icon} ${item.label}</h3>
        <p style="font-size: 1.4rem; font-weight: bold">${item.value.toFixed(5)}</p>
        <div class="metric-desc">${item.desc}</div>
      `;
  
      grid.appendChild(card);
    });
  
    document.getElementById("mm1-result-section").style.display = "block";
  });
  
  // ------- M/M/C Logic -------
  document.getElementById("mmc-form").addEventListener("submit", function (e) {
    e.preventDefault();
  
    const λ = parseFloat(document.getElementById("mmc-lemda").value);
    const μ = parseFloat(document.getElementById("mmc-meu").value);
    const c = parseInt(document.getElementById("servers").value);
  
    if (isNaN(λ) || isNaN(μ) || isNaN(c)) {
      alert("Please enter valid numbers.");
      return;
    }
  
    const ρ = λ / (c * μ);
  
    if (ρ >= 1) {
      alert("System is unstable (ρ ≥ 1), increase service rate or number of servers.");
      return;
    }
  
    const factorial = (n) => (n <= 1 ? 1 : n * factorial(n - 1));
  
    let sum = 0;
    for (let n = 0; n < c; n++) {
      sum += Math.pow(λ / μ, n) / factorial(n);
    }
  
    const lastTerm = Math.pow(λ / μ, c) / (factorial(c) * (1 - ρ));
    const P0 = 1 / (sum + lastTerm);
  
    const Lq = (P0 * Math.pow(λ / μ, c) * ρ) / (factorial(c) * Math.pow(1 - ρ, 2));
    const L = Lq + λ / μ;
    const Wq = Lq / λ;
    const W = Wq + 1 / μ;
  
    const results = [
      { label: "L", desc: "Avg in System", color: "#6a1b9a", icon: "👥", value: L },
      { label: "Lq", desc: "Avg in Queue", color: "#0288d1", icon: "⏳", value: Lq },
      { label: "W", desc: "Avg Time in System", color: "#2e7d32", icon: "🕒", value: W },
      { label: "Wq", desc: "Avg Wait Time", color: "#c62828", icon: "📉", value: Wq },
      { label: "ρ", desc: "Utilization", color: "#ff8f00", icon: "⚙️", value: ρ },
    ];
  
    const grid = document.getElementById("mmc-results-grid");
    grid.innerHTML = "";
  
    results.forEach((item) => {
      const card = document.createElement("div");
      card.className = "metric-card";
  
      card.innerHTML = `
        <h3 style="color: ${item.color}">${item.icon} ${item.label}</h3>
        <p style="font-size: 1.4rem; font-weight: bold">${item.value.toFixed(5)}</p>
        <div class="metric-desc">${item.desc}</div>
      `;
  
      grid.appendChild(card);
    });
  
    document.getElementById("mmc-result-section").style.display = "block";
  });
  

//   -------------MG1--------------------
document.getElementById('mg1-form').addEventListener('submit', function (event) {
    event.preventDefault();

    const lemda = parseFloat(document.getElementById('mg1-lemda').value);
    const minimum = parseFloat(document.getElementById('mg1-minimum').value);
    const maximum = parseFloat(document.getElementById('mg1-maximum').value);

    if (isNaN(lemda) || isNaN(minimum) || isNaN(maximum)) {
      alert('Please enter valid numeric values for all fields.');
      return;
    }

    const mue = (minimum + maximum) / 2;
    const newLemda = 1 / lemda;
    const newMue = 1 / mue;
    const ro = newLemda / newMue;
    const theta = ((maximum - minimum) ** 2) / 12;

    const newLq = (newLemda ** 2 * theta ** 2 + ro ** 2) / (2 * (1 - ro));
    const newWq = newLq / newLemda;
    const newW = newWq + 1 / newMue;
    const newL = newLemda * newW;

    const results = [
      { label: "L", desc: "Avg in System", color: "#6a1b9a", icon: "👥", value: newL },
      { label: "Lq", desc: "Avg in Queue", color: "#0288d1", icon: "⏳", value: newLq },
      { label: "W", desc: "Avg Time in System", color: "#2e7d32", icon: "🕒", value: newW },
      { label: "Wq", desc: "Avg Wait Time", color: "#c62828", icon: "📉", value: newWq },
      { label: "ρ", desc: "Utilization", color: "#ff8f00", icon: "⚙️", value: ro },
    ];

    const grid = document.getElementById("mg1-results-grid");
    grid.innerHTML = "";

    results.forEach((item) => {
      const card = document.createElement("div");
      card.className = "metric-card";

      card.innerHTML = `
        <h3 style="color: ${item.color}">${item.icon} ${item.label}</h3>
        <p style="font-size: 1.4rem; font-weight: bold">${item.value.toFixed(5)}</p>
        <div class="metric-desc">${item.desc}</div>
      `;

      grid.appendChild(card);
    });

    document.getElementById('mg1-result-section').style.display = 'block';
  });

  //Mgc
  function calculate(e) {
    e.preventDefault(); // Prevent the form from submitting and refreshing the page

    const servers = parseFloat(document.getElementById('servers').value);
    const lemda = parseFloat(document.getElementById('lemda').value);
    const minimum = parseFloat(document.getElementById('minimum').value);
    const maximum = parseFloat(document.getElementById('maximum').value);

    const μ = (minimum + maximum) / 2; // Average service time
    const ρ = lemda / (servers * μ);    // Traffic intensity

    // Calculating average number in the system (L)
    const L = (lemda * μ) / (1 - ρ);
    
    // Calculating average number in the queue (Lq)
    const Lq = (lemda ** 2 * μ ** 2) / (servers * (1 - ρ) ** 2);
    
    // Calculating average time in system (W)
    const W = L / lemda;

    // Calculating average wait time (Wq)
    const Wq = Lq / lemda;

    // Display results like in mg1
    const results = [
        { label: "L", desc: "Avg in System", color: "#6a1b9a", icon: "👥", value: L },
        { label: "Lq", desc: "Avg in Queue", color: "#0288d1", icon: "⏳", value: Lq },
        { label: "W", desc: "Avg Time in System", color: "#2e7d32", icon: "🕒", value: W },
        { label: "Wq", desc: "Avg Wait Time", color: "#c62828", icon: "📉", value: Wq },
        { label: "ρ", desc: "Utilization", color: "#ff8f00", icon: "⚙️", value: ρ },
    ];

    const resultCards = document.getElementById('resultCards');
    resultCards.style.display = 'grid';  // Ensure it's visible
    resultCards.innerHTML = ""; // Clear previous results

    results.forEach((item) => {
        const card = document.createElement("div");
        card.className = "metric-card";

        card.innerHTML = `
            <h3 style="color: ${item.color}">${item.icon} ${item.label}</h3>
            <p style="font-size: 1.4rem; font-weight: bold">${item.value.toFixed(5)}</p>
            <div class="metric-desc">${item.desc}</div>
        `;

        resultCards.appendChild(card);
    });
}







////// here is the problem




function calculateGG1(e) {
    e.preventDefault();  // Prevent form submission
    
    // Getting input values (can be negative, NaN will result in NaN)
    const lemda = parseFloat(document.getElementById('lemda').value);
    const minimum = parseFloat(document.getElementById('minimum').value);
    const varianceArrival = parseFloat(document.getElementById('varianceArrival').value);
    const varianceService = parseFloat(document.getElementById('varianceService').value);

    const E_S = minimum; // Average service time (E(S))
    const E_S2 = varianceService + (E_S ** 2); // E(S^2)

    const ρ = lemda * E_S; // Utilization

    // Calculating L (average number of customers in the system)
    const L = (lemda * E_S2) / (2 * (1 - ρ));

    // Calculating Lq (average number of customers in the queue)
    const Lq = L - ρ;

    // Calculating W (average time in the system)
    const W = L / lemda;

    // Calculating Wq (average time in the queue)
    const Wq = Lq / lemda;

    // Displaying results
    const results = [
        { label: "L", desc: "Avg in System", color: "#6a1b9a", icon: "👥", value: L },
        { label: "Lq", desc: "Avg in Queue", color: "#0288d1", icon: "⏳", value: Lq },
        { label: "W", desc: "Avg Time in System", color: "#2e7d32", icon: "🕒", value: W },
        { label: "Wq", desc: "Avg Wait Time", color: "#c62828", icon: "📉", value: Wq },
        { label: "ρ", desc: "Utilization", color: "#ff8f00", icon: "⚙️", value: ρ },
    ];

    const resultCards = document.getElementById('resultCards');
    resultCards.style.display = 'grid';  // Ensure results are displayed
    resultCards.innerHTML = ""; // Clear previous results

    results.forEach((item) => {
        const card = document.createElement("div");
        card.className = "metric-card";

        card.innerHTML = `
            <h3 style="color: ${item.color}">${item.icon} ${item.label}</h3>
            <p style="font-size: 1.4rem; font-weight: bold">${isNaN(item.value) ? 'Invalid' : item.value.toFixed(5)}</p>
            <div class="metric-desc">${item.desc}</div>
        `;

        resultCards.appendChild(card);
    });
}





function calculateGGC(e) {
    e.preventDefault();

    const lamda = parseFloat(document.getElementById('ggc-lemda').value);
    const avgService = parseFloat(document.getElementById('ggc-minimum').value);
    const varianceArrival = parseFloat(document.getElementById('ggc-varianceArrival').value);
    const varianceService = parseFloat(document.getElementById('ggc-varianceService').value);
    const servers = parseInt(document.getElementById('ggc-servers').value);

    if (servers < 1) {
        alert("Servers must be at least 1.");
        return;
    }

    const ca2 = varianceArrival / ((1 / lamda) ** 2);
    const cs2 = varianceService / (avgService ** 2);
    const rho = (lamda * avgService) / servers;

    if (rho >= 1) {
        const warning = document.createElement("div");
        warning.style.color = "red";
        warning.style.marginTop = "10px";
        warning.style.fontWeight = "bold";
        warning.textContent = "⚠️ Warning: System is unstable (ρ ≥ 1)";
        resultCards.appendChild(warning);
    }
    

    const Lq = (Math.pow(rho, Math.sqrt(2 * (servers + 1)) - 1)) * ((ca2 + cs2) / 2) * (rho / (1 - rho));
    const L = Lq + lamda * avgService;
    const Wq = Lq / lamda;
    const W = Wq + avgService;

    const results = [
        { label: "L", desc: "Avg in System", color: "#6a1b9a", icon: "👥", value: L },
        { label: "Lq", desc: "Avg in Queue", color: "#0288d1", icon: "⏳", value: Lq },
        { label: "W", desc: "Avg Time in System", color: "#2e7d32", icon: "🕒", value: W },
        { label: "Wq", desc: "Avg Wait Time", color: "#c62828", icon: "📉", value: Wq },
        { label: "ρ", desc: "Utilization", color: "#ff8f00", icon: "⚙️", value: rho },
    ];

    const resultCards = document.getElementById('resultCards');
    resultCards.style.display = 'grid';
    resultCards.innerHTML = "";

    results.forEach((item) => {
        const card = document.createElement("div");
        card.className = "metric-card";
        card.innerHTML = `
            <h3 style="color: ${item.color}">${item.icon} ${item.label}</h3>
            <p style="font-size: 1.4rem; font-weight: bold">${isNaN(item.value) ? 'Invalid' : item.value.toFixed(5)}</p>
            <div class="metric-desc">${item.desc}</div>
        `;
        resultCards.appendChild(card);
    });
}

// Add table styles
const style = document.createElement('style');
style.textContent = `
    .table-responsive {
        overflow-x: auto;
        max-height: 500px;
        border: 1px solid #dee2e6;
        border-radius: 4px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 1rem;
        background-color: white;
    }
    .table th, .table td {
        padding: 0.75rem;
        vertical-align: top;
        border-top: 1px solid #dee2e6;
    }
    .table thead th {
        vertical-align: bottom;
        border-bottom: 2px solid #dee2e6;
    }
    .table tbody + tbody {
        border-top: 2px solid #dee2e6;
    }
`;
document.head.appendChild(style);

