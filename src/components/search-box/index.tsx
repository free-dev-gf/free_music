import React, { useState } from 'react';
import { Popover, Input } from 'antd';
import orderIcon from '@assets/images/order.svg';
import randomIcon from '@assets/images/random.svg';
import pointIcon from '@assets/images/point.svg';
import './style.less';
import { SearchOutlined } from '@ant-design/icons';

export enum EPlayMode {
    ORDER,
    RANDOM,
}

type Props = {
    playMode: EPlayMode;
    onPlayModeChange: (mode: EPlayMode) => void;
    onSearch: (keyword: string) => void;
    onCancel: () => void;
    onPoint: () => void;
};

const playModes = [{
    mode: EPlayMode.ORDER,
    icon: orderIcon,
    name: '顺序播放',
}, {
    mode: EPlayMode.RANDOM,
    icon: randomIcon,
    name: '随机播放',
}]

const SearchBox: React.FC<Props> = (props) => {
    const { playMode, onPlayModeChange, onSearch, onCancel, onPoint } = props;
    const [showSearch, setShowSearch] = useState(false);

    const renderModeItem = (name: string, icon: any) => {
        return <>
            <img className="c-play-mode-icon" src={icon} />
            <div className="c-play-mode-name">
                {name}
            </div>
        </>
    }

    const currentMode = playModes.find(p => p.mode === playMode);

    return (
        <div className="c-search-box">
            <Popover
                placement="bottom"
                trigger="click"
                content={playModes.map(p =>
                    <div
                        key={p.mode}
                        className={`c-play-mode select-option ${p.mode === EPlayMode.ORDER ? 'order' : 'random'}`}
                        onClick={() => {
                            onPlayModeChange(p.mode)
                        }}
                        style={{ 
                            padding: '5px 10px',
                        }}
                    >
                        {renderModeItem(p.name, p.icon)}
                    </div>
                )}
            >
                <div className="c-play-mode">
                    {renderModeItem(currentMode.name, currentMode.icon)}
                </div>
            </Popover>
            {showSearch ? (
                <div className="c-search-box-input">
                    <Input.Search
                        autoFocus
                        onSearch={onSearch}
                        allowClear
                        style={{ width: 220 }}
                    />
                    <div
                        className="c-search-box-input-cancel"
                        onClick={() => {
                            setShowSearch(false);
                            onCancel();
                        }}
                    >
                        取消
                    </div>
                </div>
            ) : (
                <div className="c-search-box-icons">
                <img src={pointIcon} onClick={onPoint} />
                <SearchOutlined
                    style={{ fontSize: 16 }}
                    onClick={() => setShowSearch(true)}
                />
                </div>
            )}
        </div>
    );
};

export default SearchBox;