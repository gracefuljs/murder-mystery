//Helper Functions. Will use a proper library later.
export const randomInt  = (maxBound) => Math.floor( Math.random() * maxBound);
export const randomItem = (arr) => arr[ randomInt( arr.length ) ];


//Game-Centric Helper Functions
export const generateRandomGender = () => { let gender = ( randomInt(2) === 0 ) ? "Male" : "Female"; console.log(gender); return gender};
