"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var fs = require("fs");
var amount, bigs, initial_inv_level, inv_level, next_event_type, num_events, num_months, num_values_demand, smalls, area_holding, area_shortage, holding_cost, incremental_cost, maxlag, mean_interdemand, minlag, setup_cost, shortage_cost, sim_time, time_last_event, total_ordering_cost;
var prob_distrib_demand = [];
var time_next_event = [];
function expon(mean) {
    console.log("MeanValue=========", mean);
    return -mean * Math.log(Math.random());
}
var initialize = function () {
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
    console.log("InitializeFunctionValues----------------", time_next_event);
};
var order_arrival = function () {
    //Increment the inventory level by the amount ordered
    inv_level += amount;
    //Since no order is now outstanding, eliminate the order-arrival event from consideration.
    time_next_event[1] = 1.0e+30;
};
var random_integer = function (prob_distrib) {
    var i = 0;
    var u = 0.0;
    /* Generate a U(0,1) random variate. */
    u = lcgrand(1);
    /* Return a random integer in accordance with the (cumulative) distribution
    function prob_distrib. */
    for (i = 1; u >= prob_distrib[i]; ++i)
        ;
    return i;
};
var demand = function () {
    //Decrement the inventory level by a generated demand size.
    inv_level -= random_integer(prob_distrib_demand);
    // Schedule the time of the next demand.
    time_next_event[2] = sim_time + expon(mean_interdemand);
};
var evaluate = function () {
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
};
var update_time_avg_stats = function () {
    var time_since_last_event;
    //Compute time since last event, and update last-event-time marker.
    time_since_last_event = sim_time - time_last_event;
    time_last_event = sim_time;
    //Determine the status of the inventory level during the previous interval.If the inventory level during the previous interval was negative, update area_shortage. If it was positive, update area_holding. If it was zero, no update is needed.
    if (inv_level < 0)
        area_shortage -= inv_level * time_since_last_event;
    else if (inv_level > 0)
        area_holding += inv_level * time_since_last_event;
};
var report = function () {
    /* Compute and write estimates of desired measures of performance. */
    var avg_holding_cost, avg_ordering_cost, avg_shortage_cost;
    avg_ordering_cost = total_ordering_cost / num_months;
    avg_holding_cost = holding_cost * area_holding / num_months;
    avg_shortage_cost = shortage_cost * area_shortage / num_months;
    // fprintf(outfile, "\n\n(%3d,%3d)%15.2f%15.2f%15.2f%15.2f",
    // );
    // writeFileFunc('output.txt',{smalls, bigs,
    // avg_ordering_cost + avg_holding_cost + avg_shortage_cost, avg_ordering_cost, avg_holding_cost, avg_shortage_cost})
    writeFileFunc('output.txt', " This Report generated values are ".concat(smalls, ", ").concat(bigs, ", ").concat(avg_ordering_cost + avg_holding_cost + avg_shortage_cost, " , ").concat(avg_ordering_cost, ", ").concat(avg_holding_cost, ", ").concat(avg_shortage_cost));
};
var lcgrand = function (int, stream) {
    var zrng = [1, 1973272912, 281629770, 20006270, 1280689831, 2096730329, 1933576050, 913566091, 246780520, 1363774876, 604901985, 1511192140, 1259851944,
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
    var zi, lowprd, hi31;
    var MODLUS = 2147483647;
    var MULT1 = 24112;
    var MULT2 = 26143;
    zi = zrng[stream];
    lowprd = (zi & 65535) * MULT1;
    hi31 = (zi >> 16) * MULT1 + (lowprd >> 16);
    zi = ((lowprd & 65535) - MODLUS) +
        ((hi31 & 32767) << 16) + (hi31 >> 15);
    if (zi < 0)
        zi += MODLUS;
    lowprd = (zi & 65535) * MULT2;
    hi31 = (zi >> 16) * MULT2 + (lowprd >> 16);
    zi = ((lowprd & 65535) - MODLUS) +
        ((hi31 & 32767) << 16) + (hi31 >> 15);
    if (zi < 0)
        zi += MODLUS;
    zrng[stream] = zi;
    return (zi >> 7 | 1) / 16777216.0;
};
function uniform(a, b) {
    /* Return a U(a,b) random variate. */
    return a + lcgrand(1) * (b - a);
}
var emptyTextFile = function () {
    fs.writeFileSync('output.txt', '');
};
var writeFileFunc = function (fileName, Message) {
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
};
function timing() {
    var i = 0;
    var min_time_next_event = 1.0e29;
    next_event_type = 0;
    /* Determine the event type of the next event to occur. */
    num_events = 3;
    // console.log("NumberEvents===================", num_events);
    for (i = 1; i <= num_events; ++i) {
        console.log(time_next_event[i], min_time_next_event, "<<<<<<<<<TimeNextEvent");
        console.log(time_next_event[i] < min_time_next_event, "<<<<<<<<<<<<<<<<<<<<<<<ThisCondition");
        if (time_next_event[i] < min_time_next_event) {
            // console.log('123322', min_time_next_event);
            console.log("NoOFiTERATIONS--------------------------", i);
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
        writeFileFunc("output.txt", "\nEvent list empty at time %f ".concat(sim_time));
        return;
    }
    sim_time = min_time_next_event;
}
var readFile = function (fileName) { return __awaiter(void 0, void 0, void 0, function () {
    var doc;
    return __generator(this, function (_a) {
        doc = fs.readFileSync(fileName, 'utf8');
        console.log("doC---12373", doc);
        return [2 /*return*/, doc];
    });
}); };
var main = function () { return __awaiter(void 0, void 0, void 0, function () {
    var num_policies, file, inputFileDataArray, i, prob_distrib_demand_1, i, i, i;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                emptyTextFile();
                return [4 /*yield*/, readFile('infile.txt')];
            case 1:
                file = _a.sent();
                console.log("File Data------------------------------", file);
                inputFileDataArray = file.split(',');
                initial_inv_level = parseInt(inputFileDataArray[0]);
                num_months = parseInt(inputFileDataArray[1]);
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
                for (i = 1; i <= num_values_demand; ++i) {
                    prob_distrib_demand_1 = i;
                }
                // Write report heading and input parameters.
                writeFileFunc('output.txt', "Single-product inventory system\n\n");
                writeFileFunc('output.txt', "\"Initial inventory level ".concat(initial_inv_level, " items\n\n"));
                writeFileFunc('output.txt', "Number of demand sizes ".concat(num_values_demand, " \n\n"));
                writeFileFunc('output.txt', "Distribution function of demand sizes");
                for (i = 1; i <= num_values_demand; ++i)
                    writeFileFunc('output.txt', "\n\n %f ".concat(prob_distrib_demand));
                /* Write report heading and input parameters. */
                writeFileFunc('output.txt', "Single-product inventory system\n\n");
                writeFileFunc('output.txt', "Initial inventory level ".concat(initial_inv_level, " items\n\n "));
                writeFileFunc('output.txt', "Number of demand sizes%25d   ".concat(num_values_demand, "\n\n"));
                writeFileFunc('output.txt', "Distribution function of demand sizes ");
                for (i = 1; i <= num_values_demand; ++i) {
                    writeFileFunc('output.txt', "%8.3f ".concat(prob_distrib_demand));
                }
                writeFileFunc('output.txt', "\n\nMean interdemand time%26.2f  ".concat(mean_interdemand, "\n\n"));
                writeFileFunc('output.txt', "Delivery lag range%29.2f to%10.2f months\n\n ".concat(minlag, ", ").concat(maxlag));
                writeFileFunc('output.txt', "Length of the simulation%23d months\n\n, ".concat(num_months));
                writeFileFunc('output.txt', "K =%6.1f i =%6.1f h =%6.1f pi =%6.1f\n\n,".concat(setup_cost, ", ").concat(incremental_cost, ", ").concat(holding_cost, ", ").concat(shortage_cost));
                writeFileFunc('output.txt', "Number of policies%29d\n\n ".concat(num_policies));
                writeFileFunc('output.txt', " Average Average");
                writeFileFunc('output.txt', " Average Average\n");
                writeFileFunc('output.txt', " Policy total cost ordering cost");
                writeFileFunc('output.txt', " holding cost shortage cost");
                for (i = 1; i <= num_policies; ++i) {
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
                return [2 /*return*/];
        }
    });
}); };
main();
