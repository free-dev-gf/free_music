import React, { useEffect, useRef, useState } from 'react';
import './style.less';

export type Lyric = {
    text: string;
    startTime: number;
    endTime: number;
}[];

type Props = {
    name: string;
    artist: string;
    lyric: Lyric;
    time: number;
    offset: number;
};

const LyricPanel: React.FC<Props> = (props) => {
    const { name, artist, lyric, time, offset } = props;
    const [maskWidth, setMaskWidth] = useState<number[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const stamp = time + offset;
    const lastTime = useRef(0);
    const [transitionDisabled, setTransitionDisabled] = useState(false);

    useEffect(() => {
        const isMutation = Math.abs(lastTime.current - time) > 2;
        const index = lyric.findIndex(a => a.startTime < stamp && a.endTime >= stamp);
        lastTime.current = time;
        if (index === -1) {
            return;
        }
        const { startTime, endTime } = lyric[index];
        const ratio = (stamp - startTime) / (endTime - startTime);
        if (isMutation) {
            setTransitionDisabled(true);
            setTimeout(() => {
                setTransitionDisabled(false);
            }, 300);
            setMaskWidth(lyric.map(a => {
                if (a.startTime >= stamp) {
                    return 0;
                }
                if (a.endTime < stamp) {
                    return 100;
                }
                return ratio * 100;
            }));
        } else {
            const newMaskWidth = maskWidth.slice();
            newMaskWidth[index] = maskWidth[index] === 100 ? 100 : ratio * 100;
            setMaskWidth(newMaskWidth);
        }
        if (index > currentIndex || isMutation) {
            if (!isMutation) {
                const newMaskWidth = maskWidth.slice();
                newMaskWidth[index - 1] = 100;
                if (index === lyric.length - 1) {
                    newMaskWidth[index] = 100;
                }
                setMaskWidth(newMaskWidth);
            }
            setTimeout(() => {
                document.querySelectorAll('.c-lyric-panel-lyric-item')[index].scrollIntoView({
                    behavior: "smooth",
                    block: "center",
                });
            }, 500);
        }
        setCurrentIndex(index);
    }, [time]);

    return (
        <div className="c-lyric-panel">
            <div className="c-lyric-panel-name">{name}</div>
            <div className="c-lyric-panel-artist">{artist}</div>
            {lyric.length ? (
                <div className="c-lyric-panel-lyric">
                    {lyric.map((a, index) => (
                        <div
                            key={index}
                            className="c-lyric-panel-lyric-item"
                            style={{
                                backgroundSize: `${maskWidth[index] || 0}% 100%`,
                                transition: transitionDisabled ? '' : "background-size 1s linear",
                            }}
                        >
                            {a.text}
                        </div>
                    ))}
                </div>
            ) : (
                <div className="c-lyric-panel-empty">暂无歌词</div>
            )}
        </div>
    );
};

export default LyricPanel;