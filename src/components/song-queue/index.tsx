import React from 'react';
import './style.less';

type Props = {
    songs: string[];
    currentPlay: string;
    onPlay: (name: string) => void;
};

const SongQueue: React.FC<Props> = (props) => {
    const { songs, currentPlay, onPlay } = props;
    return (
        <div className="c-song-queue">
           {songs.map((song, index) => (
                <div
                    key={index}
                    className={`c-song-queue-item${currentPlay === song ? ' active' : ''}`}
                    onDoubleClick={() => {
                        if (song !== currentPlay) {
                            onPlay(song);
                        }
                    }}
                >
                    <span className="c-song-queue-item-index">{index + 1}</span>
                    <span className="c-song-queue-item-name">
                        {song.replace('.mp3', '')}
                    </span>
                </div>
           ))}
        </div>
    );
};

export default SongQueue;