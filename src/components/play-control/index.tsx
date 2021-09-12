import React, { useState } from 'react';
import './style.less';
import menuImg from '@assets/images/menu.svg';
import volumeImg from '@assets/images/volume.svg';
import playImg from '@assets/images/play.svg';
import pauseImg from '@assets/images/pause.svg';
import backImg from '@assets/images/back.svg';
import nextImg from '@assets/images/next.svg';
import { Slider, Popover } from 'antd';
import SongQueue from '../song-queue';

type Props = {
    isPlaying: boolean;
    time: number;
    duration: number;
    volume: number;
    currentPlay: string;
    queue: string[];
    onPlay: () => void;
    onPause: () => void;
    onChange: (time: number) => void;
    onAfterChange: (time: number) => void;
    onBack: () => void;
    onNext: () => void;
    onVolumeChange: (volume: number) => void;
    onVolumeAfterChange: (volume: number) => void;
    onSongQueuePlay: (name: string) => void;
};

const PlayControl: React.FC<Props> = (props) => {
    const {
        isPlaying,
        time,
        duration,
        volume,
        queue,
        currentPlay,
        onPlay,
        onPause,
        onChange,
        onAfterChange,
        onBack,
        onNext,
        onVolumeChange,
        onVolumeAfterChange,
        onSongQueuePlay,
    } = props;
    const [showVolume, setShowVolume] = useState(false);

    return (
        <div className="c-play-control">
            <audio id="c-play-control-audio" />
            <div className="c-play-control-slider">
                <Slider
                    disabled={!duration}
                    min={0}
                    max={duration}
                    value={time}
                    tooltipVisible={false}
                    onChange={onChange}
                    onAfterChange={onAfterChange}
                />
            </div>
            <div className="c-play-control-menu">
                <Popover
                    placement="topLeft"
                    trigger="click"
                    content={
                        <SongQueue
                            currentPlay={currentPlay}
                            songs={queue}
                            onPlay={(name: string) => {
                                onSongQueuePlay(name);
                            }}
                        />
                    }
                >
                    <img
                        className="c-play-control-menu-icon"
                        src={menuImg}
                    />
                </Popover>
            </div>
            <div className="c-play-control-play">
                <img
                    className="c-play-control-play-icon"
                    src={backImg}
                    onClick={onBack}
                />
                <img
                    className="c-play-control-play-icon"
                    src={isPlaying ? playImg : pauseImg}
                    onClick={isPlaying ? onPause : onPlay}
                />
                <img
                    className="c-play-control-play-icon"
                    src={nextImg}
                    onClick={onNext}
                />
            </div>
            <div className="c-play-control-volume">
                <img
                    className="c-play-control-volume-icon"
                    src={volumeImg}
                    onClick={() => setShowVolume(!showVolume)}
                />
                {showVolume ? (
                    <div className="c-play-control-volume-slider">
                        <Slider
                            min={0}
                            max={100}
                            value={volume}
                            onChange={onVolumeChange}
                            onAfterChange={onVolumeAfterChange}
                            tooltipVisible={false}
                            vertical={true}
                        />
                    </div>
                ) : null}
            </div>
        </div>
    );
};

export default PlayControl;