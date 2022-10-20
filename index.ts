import * as  fs from 'fs';

let amount: number, bigs: number, initial_inv_level: number, inv_level: number, next_event_type: number, num_events: number,
    num_months: number, num_values_demand: number, smalls: number, area_holding: number, area_shortage: number, holding_cost: number, incremental_cost: number, maxlag,
    mean_interdemand: any, minlag, setup_cost, shortage_cost, sim_time: number, time_last_event, total_ordering_cost;

let prob_distrib_demand: [number] | any = [];
let time_next_event: [number] | any = [];


function expon(mean) {
    console.log("MeanValue=========", mean)
    return -mean * Math.log(Math.random());
}


const initialize = () => {
    console.log("InsideInitializeFunction");
    //Initiating the simulation time
    sim_time = 0.0;

    //Initializing the state variables 

    inv_level = initial_inv_level;
    time_last_event = 0.0;

    //Initializing the statistical counter 



    total_ordering_cost = 0.0;
    area_holding = 0.0;
    area_shortage = 0.0;

    time_next_event[1] = 1.0e+30;
    time_next_event[2] = sim_time + expon(mean_interdemand);
    time_next_event[3] = num_months;
    time_next_event[4] = 0.0;

    console.log("InitializeFunctionValues----------------", time_next_event)
}

const order_arrival = () => {
    //Increment the inventory level by the amount ordered

    inv_level += amount;

    //Since no order is now outstanding, eliminate the order-arrival event from consideration.

    time_next_event[1] = 1.0e+30;

}
const random_integer = (prob_distrib: [number]) => {
    let i = 0;
    let u = 0.0;
    /* Generate a U(0,1) random variate. */
    u = lcgrand(1);
    /* Return a random integer in accordance with the (cumulative) distribution
    function prob_distrib. */
    for (i = 1; u >= prob_distrib[i]; ++i)
        ;
    return i;
}
const demand = () => {
    //Decrement the inventory level by a generated demand size.

    inv_level -= random_integer(prob_distrib_demand);

    // Schedule the time of the next demand.
    time_next_event[2] = sim_time + expon(mean_interdemand);

}

const evaluate = () => {
    //Check whether inventory level is less then smalls 
    if (inv_level < smalls) {
        //The inventory level is less than smalls, so place an order for the appropriate amount.

        amount = bigs - inv_level;
        total_ordering_cost += setup_cost + incremental_cost * amount;

        //Schedule the arrival of the order.
        time_next_event[1] = sim_time + uniform(minlag, maxlag);
    }
    //Regardless of the place-order decision, schedule the next inventory evaluation.
    time_next_event[4] = sim_time + 1.0;

}

const update_time_avg_stats = () => {
    let time_since_last_event: number;

    //Compute time since last event, and update last-event-time marker.
    time_since_last_event = sim_time - time_last_event;
    time_last_event = sim_time;

    //Determine the status of the inventory level during the previous interval.If the inventory level during the previous interval was negative, update area_shortage. If it was positive, update area_holding. If it was zero, no update is needed.
    if (inv_level < 0)
        area_shortage -= inv_level * time_since_last_event;
    else if (inv_level > 0)
        area_holding += inv_level * time_since_last_event;

}

const report = () => {

    /* Compute and write estimates of desired measures of performance. */

    let avg_holding_cost, avg_ordering_cost, avg_shortage_cost;
    avg_ordering_cost = total_ordering_cost / num_months;
    avg_holding_cost = holding_cost * area_holding / num_months;
    avg_shortage_cost = shortage_cost * area_shortage / num_months;
    // fprintf(outfile, "\n\n(%3d,%3d)%15.2f%15.2f%15.2f%15.2f",
    // );
    // writeFileFunc('output.txt',{smalls, bigs,
    // avg_ordering_cost + avg_holding_cost + avg_shortage_cost, avg_ordering_cost, avg_holding_cost, avg_shortage_cost})

    writeFileFunc('output.txt', ` This Report generated values are ${smalls}, ${bigs}, ${avg_ordering_cost + avg_holding_cost + avg_shortage_cost} , ${avg_ordering_cost}, ${avg_holding_cost}, ${avg_shortage_cost}`)

}

const lcgrand = (int: any, stream?: any) => {

    let zrng = [1, 1973272912, 281629770, 20006270, 1280689831, 2096730329, 1933576050, 913566091, 246780520, 1363774876, 604901985, 1511192140, 1259851944,
        824064364, 150493284, 242708531, 75253171, 1964472944, 1202299975,
        233217322, 1911216000, 726370533, 403498145, 993232223, 1103205531,
        762430696, 1922803170, 1385516923, 76271663, 413682397, 726466604,
        336157058, 1432650381, 1120463904, 595778810, 877722890, 1046574445,
        68911991, 2088367019, 748545416, 622401386, 2122378830, 640690903,
        1774806513, 2132545692, 2079249579, 78130110, 852776735, 1187867272,
        1351423507, 1645973084, 1997049139, 922510944, 2045512870, 898585771,
        243649545, 1004818771, 773686062, 403188473, 372279877, 1901633463,
        498067494, 2087759558, 493157915, 597104727, 1530940798, 1814496276,
        536444882, 1663153658, 855503735, 67784357, 1432404475, 619691088,
        119025595, 880802310, 176192644, 1116780070, 277854671, 1366580350,
        1142483975, 2026948561, 1053920743, 786262391, 1792203830, 1494667770,
        1923011392, 1433700034, 1244184613, 1147297105, 539712780, 1545929719,
        190641742, 1645390429, 264907697, 620389253, 1502074852, 927711160,
        364849192, 2049576050, 638580085, 547070247];
    let zi: number, lowprd: number, hi31: number;
    let MODLUS = 2147483647;
    let MULT1 = 24112;
    let MULT2 = 26143;

    zi = zrng[stream];
    lowprd = (zi & 65535) * MULT1;
    hi31 = (zi >> 16) * MULT1 + (lowprd >> 16);
    zi = ((lowprd & 65535) - MODLUS) +
        ((hi31 & 32767) << 16) + (hi31 >> 15);
    if (zi < 0) zi += MODLUS;
    lowprd = (zi & 65535) * MULT2;
    hi31 = (zi >> 16) * MULT2 + (lowprd >> 16);
    zi = ((lowprd & 65535) - MODLUS) +
        ((hi31 & 32767) << 16) + (hi31 >> 15);
    if (zi < 0) zi += MODLUS;
    zrng[stream] = zi;
    return (zi >> 7 | 1) / 16777216.0;
}

function uniform(a: number, b: number) /* Uniform variate generation function. */ {
    /* Return a U(a,b) random variate. */
    return a + lcgrand(1) * (b - a);
}

const emptyTextFile = ()=>{
    fs.writeFileSync('output.txt','');
}

const writeFileFunc = (fileName: any, Message: string) => {
    fs.appendFileSync(fileName, Message
        // function (err) {
        // if (err) {
        //     return console.error(err);
        // }

        // If no error the remaining code executes
        // console.log(" Finished writing ");
        // console.log("Reading the data that's written");

        // Reading the file
    //     fs.readFile(fileName, function (err, data) {
    //         if (err) {
    //             return console.error(err);
    //         } else {
    //             return data;
    //         }
    //         //   console.log("Data read : " + data.toString());
    //     });
    // }
    );
}

function timing() {
    let i = 0;
    let min_time_next_event = 1.0e29;
    next_event_type = 0;
    /* Determine the event type of the next event to occur. */

    num_events = 3;

    // console.log("NumberEvents===================", num_events);
    
    for (i = 1; i <= num_events; ++i) {
        console.log(time_next_event[i],min_time_next_event, "<<<<<<<<<TimeNextEvent")
        console.log(time_next_event[i] < min_time_next_event, "<<<<<<<<<<<<<<<<<<<<<<<ThisCondition")
        if (time_next_event[i] < min_time_next_event) {
            // console.log('123322', min_time_next_event);

            console.log("NoOFiTERATIONS--------------------------",i)
            min_time_next_event = time_next_event[i];
            next_event_type = i;
        }
    }
    /* Check to see whether the event list is empty. */
    if (next_event_type == 0) {
        /* The event list is empty, so stop the simulation. */
        console.log("Insode nex_event_typeCondition");
        // console.log(

        // );
        writeFileFunc("output.txt", `\nEvent list empty at time %f ${sim_time}`)
        return;
    }
    sim_time = min_time_next_event;
}

const readFile = async (fileName: any) => {

    let doc = fs.readFileSync(fileName, 'utf8');
    console.log("doC---12373", doc)
    return doc;
}

const main = async () => {
    emptyTextFile();
    let num_policies;

    //Open input and output files\
    let file = await readFile('infile.txt');

    console.log("File Data------------------------------", file)
    let inputFileDataArray = file.split(',');

    initial_inv_level = parseInt(inputFileDataArray[0]);
    num_months = parseInt(inputFileDataArray[1])
    num_policies = parseInt(inputFileDataArray[2]);
    num_values_demand = parseInt(inputFileDataArray[3]);
    mean_interdemand = parseInt(inputFileDataArray[4]);
    setup_cost = parseInt(inputFileDataArray[5]);
    incremental_cost = parseInt(inputFileDataArray[6]);
    holding_cost = parseInt(inputFileDataArray[7]);
    shortage_cost = parseInt(inputFileDataArray[8]);
    minlag = parseInt(inputFileDataArray[9]);
    maxlag = parseInt(inputFileDataArray[10]);

    // console.log("MeanInterDemand-------------------", mean_interdemand);

    for (let i = 1; i <= num_values_demand; ++i) {
        let prob_distrib_demand = i;
    }
    // Write report heading and input parameters.

    writeFileFunc('output.txt', `Single-product inventory system\n\n`);
    writeFileFunc('output.txt', `"Initial inventory level ${initial_inv_level} items\n\n`);
    writeFileFunc('output.txt', `Number of demand sizes ${num_values_demand} \n\n`);
    writeFileFunc('output.txt', `Distribution function of demand sizes`);

    for (let i = 1; i <= num_values_demand; ++i) writeFileFunc('output.txt', `\n\n %f ${prob_distrib_demand}`);

    /* Write report heading and input parameters. */
    writeFileFunc('output.txt', "Single-product inventory system\n\n");
    writeFileFunc('output.txt', `Initial inventory level ${initial_inv_level} items\n\n `);
    writeFileFunc('output.txt', `Number of demand sizes%25d   ${num_values_demand}\n\n`);
    writeFileFunc('output.txt', "Distribution function of demand sizes ");
    for (let i = 1; i <= num_values_demand; ++i) {
        writeFileFunc('output.txt', `%8.3f ${prob_distrib_demand}`);
    }

    writeFileFunc('output.txt', `\n\nMean interdemand time%26.2f  ${mean_interdemand}\n\n`);
    writeFileFunc('output.txt', `Delivery lag range%29.2f to%10.2f months\n\n ${minlag}, ${maxlag}`);
    writeFileFunc('output.txt', `Length of the simulation%23d months\n\n, ${num_months}`);
    writeFileFunc('output.txt', `K =%6.1f i =%6.1f h =%6.1f pi =%6.1f\n\n,${setup_cost}, ${incremental_cost}, ${holding_cost}, ${shortage_cost}`);
    writeFileFunc('output.txt', `Number of policies%29d\n\n ${num_policies}`);
    writeFileFunc('output.txt', " Average Average");
    writeFileFunc('output.txt', " Average Average\n");
    writeFileFunc('output.txt', " Policy total cost ordering cost");
    writeFileFunc('output.txt', " holding cost shortage cost");


    for (let i = 1; i <= num_policies; ++i) {
        // Read the inventory policy, and initialize the simulation.

        smalls = 2;
        bigs = 10;
        initialize();

        /* Run the simulation until it terminates after an end-simulation event
        (type 3) occurs. */
        do {
            timing();
            update_time_avg_stats();

            switch (next_event_type) {
                case 1:
                    order_arrival();
                    break;
                case 2:
                    demand();
                    break;
                case 3:
                    report();
                    break;
                case 4:
                    evaluate();
                    break;
            }
        } while (next_event_type != 3);
        // timing();
        // update_time_avg_stats();


    }
}
main()