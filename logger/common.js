// Provides functions for printing elements into the terminal

function printHeader(header) {
    console.log(`           *** ` + header + ` ***           `);
}

function printDivider() {
    console.log(`                   -Live Information-                  `);
    console.log(`-------------------------------------------------------`);
}

module.exports.printHeader = printHeader;
module.exports.printDivider = printDivider;