'use strict';

const { spawn } = require("child_process");

module.exports = {
    run_script: run_script1,
    run_script1,
    run_script2,
    kill_script,
    get_stdout,
    get_exit_code
};

let stdout_data, exit_code, pid, solved;

function run_script1(cmd, ...argv) {
    stdout_data = '';
    exit_code = undefined;
    pid = undefined;
    solved = false;
    return run_script_return(false, cmd, argv)
}

function run_script2(cmd, ...argv) {
    stdout_data = '';
    exit_code = undefined;
    pid = undefined;
    solved = false;
    return run_script_return(true, cmd, argv)
}

function run_script_return(on_data, cmd, argv) {
    return new Promise(resolve => {
        
        const ps = spawn(cmd, argv);
        pid = ps.pid;

        ps.stdout.on('data', (data) => {
            console.log('stdout', data.toString('utf-8'))
            stdout_data += data.toString('utf-8');
            if (!solved && on_data) {
                solved = true;
                resolve();
            }
        });
          
        ps.stderr.on('data', (data) => {
            console.log('stderr', data.toString('utf-8'));
            console.error(data.toString('utf-8'))
            if (!solved && on_data) {
                solved = true;
                resolve();
            }
        });
          
        ps.on('close', (code) => {
            exit_code = code;
            if (!solved && !on_data) {
                solved = true;
                resolve();
            }
        });
    });
}

function kill_script() {
    if (pid) {
        process.kill(pid, 'SIGINT');
    } else {
        console.error('no pid to kill');
    }
}

function get_stdout() {
    return stdout_data;
}

function get_exit_code() {
    return exit_code;
}