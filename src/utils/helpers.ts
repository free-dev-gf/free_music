/**
 * Checks if process NODE_ENV in 'development' mode
 */
export function inDev(): boolean {
  return process.env.NODE_ENV == 'development';
}

export function throttle(func: Function, interval = 1000): (t: number) => void {
    let flag = false;
    return function(...args) {
        if (flag) {
            return;
        }
        flag = true;
        func(...args);
        setTimeout(() => {
            flag = false;
        }, interval);
    }
}

function shuffle(arr: string[]): string[] {
    for (var i = arr.length - 1; i > 0; i--) {
        const index = Math.floor(i * Math.random());
        var a = arr[i];
        arr[i] = arr[index];
        arr[index] = a;
    }
    return arr;
}

export function getRandomQueue(songs: string[], firstSong: string) {
    songs.splice(songs.indexOf(firstSong), 1);
    return [firstSong, ...shuffle(songs)];
}
