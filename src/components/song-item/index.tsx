import React from 'react';
import addImg from '@assets/images/add.svg';
import './style.less';

type Props = {
    active: boolean;
    name: string;
    artist: string;
    keyword: string;
    onPlay: () => void;
    onAddToQueue: React.MouseEventHandler<HTMLImageElement>
    onContextMenu: React.MouseEventHandler<HTMLDivElement>;
};

const SongItem: React.FC<Props> = (props) => {
    const { name, artist, keyword, onPlay, active, onContextMenu, onAddToQueue } = props;
    const renderText = (str: string) => {
        if (!str || !str.includes(keyword)) {
            return str;
        }
        const startIndex = str.indexOf(keyword);
        const endIndex = startIndex + keyword.length;
        return keyword ? <span>
            {str.slice(0, startIndex)}
            <span className="c-song-item-highlight">{keyword}</span>
            {str.slice(endIndex)}
        </span> : str;
    }
    return (
        <div
            className={`c-song-item${active ? ' active' : ''}`}
            onDoubleClick={() => {
                if (!active) {
                    onPlay();
                }
            }}
            onContextMenu={onContextMenu}
        >
            <div className="c-song-item-add">
                <img src={addImg} onClick={active ? () => {} : onAddToQueue} />
            </div>
            <div className="c-song-item-content">
                <div className="c-song-item-content-name">
                    {renderText(name)}
                </div>
                <div className="c-song-item-content-artist">
                    {renderText(artist)}
                </div>
            </div>
        </div>
    );
};

export default SongItem;