import React, { useEffect, useRef, useState } from 'react';
import { hot } from 'react-hot-loader';
import SongList, { IListItem } from './components/song-list';
import SongItem from './components/song-item';
import './Application.less';
import { IpcRenderer } from 'electron';
import SearchBox, { EPlayMode } from './components/search-box';
import PlayControll from './components/play-control';
import 'antd/dist/antd.css';
import { message, Modal, Button, Form, Input } from 'antd';
import { useInterval } from 'react-use';
import useKeyboardJs from 'react-use/lib/useKeyboardJs';
import LyricPanel, { Lyric } from './components/lyric-panel';
import { getRandomQueue } from './utils/helpers';
import { Menu, Item, Submenu, useContextMenu } from 'react-contexify';
import 'react-contexify/dist/ReactContexify.css';
import addImg from '@assets/images/add.svg';
import settingImg from '@assets/images/setting.svg';
import { FormInstance } from 'antd/es/form';

const TWEEN = require('@tweenjs/tween.js');

type Props = {
    ipcRenderer: IpcRenderer;
};

type Config = {
    musicDir: string;
};

const MENU_ID = 'song-menu';

const Application: React.FC<Props> = (props) => {
    const { ipcRenderer } = props;
    const [list, setList] = useState<IListItem[]>([]);
    const [currentListId, setCurrentListId] = useState('');
    const [playMode, setPlayMode] = useState<EPlayMode>(EPlayMode.ORDER);
    const [renderSongs, setRenderSongs] = useState<string[]>([]);
    const [keyword, setKeyword] = useState<string>('');
    const [currentPlay, setCurrentPlay] = useState<string>('');
    const currentList = list.find((a) => a.id === currentListId) || {
        songs: [],
    };
    const audioContext = useRef<AudioContext>();
    const audioBuffer = useRef<AudioBuffer>();
    const audioSource = useRef<AudioBufferSourceNode>();
    const volumeNode = useRef<GainNode>();
    const [time, setTime] = useState(0);
    const [volume, setVolume] = useState(50);
    const [duration, setDuration] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [queue, setQueue] = useState<string[]>([]);
    const [currentHandleSong, setCurrentHandleSong] = useState<string>();
    const { show: showSongMenu } = useContextMenu({ id: MENU_ID });
    const [lyric, setLyric] = useState<Lyric>([]);
    const requestRef = useRef<any>();
    const [config, setConfig] = useState<Config>({ musicDir: '' });
    const [showConfig, setShowConfig] = useState<boolean>(false);
    const configRef = useRef<FormInstance>();
    const [isPressed] = useKeyboardJs('command + p');

    useEffect(() => {
        if (!isPressed || !currentPlay) {
            return;
        }
        if (isPlaying) {
            suspendPlay();
        } else {
            setIsPlaying(true);
            playBuffer(time);
        }
    }, [isPressed]);

    const playBuffer = (startTime = 0) => {
        audioSource.current?.stop();
        audioSource.current = audioContext.current.createBufferSource();
        audioSource.current.buffer = audioBuffer.current;
        audioSource.current.connect(volumeNode.current);
        audioSource.current.start(0, startTime);
        resumePlay();
        setTime(startTime);
        setDuration(Math.round(audioBuffer.current.duration));
    };

    const playSong = (name: string) => {
        suspendPlay();
        ipcRenderer.invoke('get-song', name).then((res) => {
            const { code, data } = res;
            if (code === 0) {
                audioContext.current.decodeAudioData(
                    data,
                    (buffer) => {
                        audioBuffer.current = buffer;
                        playBuffer();
                        setCurrentPlay(name);
                    },
                    (err) => {
                        message.error('music decode failed');
                        console.error(err);
                    },
                );
            } else {
                message.error(res.message);
            }
        });
        ipcRenderer
            .invoke('get-lyric', name.replace('.mp3', '.lrc'))
            .then((res) => {
                setLyric(res);
            });
    };

    const suspendPlay = () => {
        audioContext.current?.suspend();
        setIsPlaying(false);
    };

    const resumePlay = () => {
        audioContext.current?.resume();
        setIsPlaying(true);
    };

    useInterval(
        () => {
            setTime(time + 1);
            if (time + 1 >= duration) {
                const index = queue.indexOf(currentPlay);
                if (index < queue.length - 1) {
                    playSong(queue[index + 1]);
                } else {
                    suspendPlay();
                }
            }
        },
        isPlaying ? 1000 : null,
    );

    useEffect(() => {
        if (showConfig) {
            configRef.current?.setFieldsValue(config);
        }
    }, [showConfig]);

    const refreshSongs = (res: IListItem[]) => {
        if (!res[0]) {
            return;
        }
        const { id, songs } = res[0];
        setCurrentListId(id);
        setRenderSongs(songs);
        setList(res);
    };

    useEffect(() => {
        if (config.musicDir) {
            ipcRenderer.invoke('refresh-all-songs').then((res: IListItem[]) => {
                refreshSongs(res);
            });
        }
    }, [config.musicDir]);

    useEffect(() => {
        audioContext.current = new AudioContext();
        ipcRenderer.invoke('get-config').then((res) => {
            setConfig(res);
            if (res.musicDir) {
                ipcRenderer.invoke('get-songs').then((result: IListItem[]) => {
                    refreshSongs(result);
                });
            }
        });
        volumeNode.current = audioContext.current.createGain();
        volumeNode.current.connect(audioContext.current.destination);
    }, []);

    const changeList = (id: string) => {
        setCurrentListId(id);
        setRenderSongs(list.find((a) => a.id === id).songs);
    };

    const changePlayMode = (mode: EPlayMode) => {
        setPlayMode(mode);
    };

    const searchMusic = (keyword: string) => {
        setRenderSongs(currentList.songs.filter((s) => s.includes(keyword)));
        setKeyword(keyword);
    };

    const onCancelSearch = () => {
        setKeyword('');
        setRenderSongs(currentList.songs);
    };

    const addList = (name: string) => {
        ipcRenderer.invoke('add-list', name).then((data) => {
            setList(data);
        });
    };

    const addSongToList = (listId: string) => {
        ipcRenderer
            .invoke('add-song-to-list', currentHandleSong, listId)
            .then((data) => {
                setList(data);
            });
    };

    const onSongContextMenu = ({ song, e }: { song: string; e: any }) => {
        setCurrentHandleSong(song);
        showSongMenu(e);
    };

    const animate = (time) => {
        requestRef.current = requestAnimationFrame(animate);
        TWEEN.update(time);
    };

    useEffect(() => {
        requestRef.current = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(requestRef.current);
    }, []);

    const createTween = (e: any) => {
        const { x: startX, y: startY } = e.target.getBoundingClientRect();
        const menu = document.querySelector('.c-play-control-menu-icon');
        const { x: endX, y: endY } = menu.getBoundingClientRect();
        const coords = { x: startX, y: startY };
        const ele = document.createElement('img');
        ele.className = 'tween-add-music-img';
        ele.src = addImg;
        document.body.appendChild(ele);
        const tween = new TWEEN.Tween(coords)
            // @ts-ignore
            .to({ x: endX, y: endY }, 600)
            .easing(TWEEN.Easing.Quadratic.In)
            .onUpdate(() => {
                ele.style.setProperty('left', `${coords.x}px`);
                ele.style.setProperty('top', `${coords.y}px`);
            })
            .onComplete(() => {
                document.body.removeChild(ele);
            });
        tween.start();
    };

    const [currentArtist, currentName] = currentPlay
        .replace('.mp3', '')
        .split('-')
        .map((a) => a.trim());

    return (
        <div className='free-music'>
            <div className='free-music-title'>
                <span>自由音乐</span>
                <img src={settingImg} onClick={() => setShowConfig(true)} />
            </div>
            <div className='free-music-content'>
                <div className='free-music-content-list'>
                    <SongList
                        list={list}
                        currentListId={currentListId}
                        onChangeList={changeList}
                        onAddList={addList}
                    />
                </div>
                <div className='free-music-content-song'>
                    <SearchBox
                        playMode={playMode}
                        onPlayModeChange={changePlayMode}
                        onSearch={searchMusic}
                        onCancel={onCancelSearch}
                    />
                    <div className='free-music-content-song-list'>
                        {renderSongs.map((completeName, idx) => {
                            const [artist, name] = completeName
                                .replace('.mp3', '')
                                .split('-')
                                .map((a) => a.trim());
                            return (
                                <SongItem
                                    active={currentPlay === completeName}
                                    key={idx}
                                    name={name}
                                    artist={artist}
                                    keyword={keyword}
                                    onPlay={() => {
                                        if (playMode === EPlayMode.RANDOM) {
                                            setQueue(
                                                getRandomQueue(
                                                    renderSongs.slice(),
                                                    completeName,
                                                ),
                                            );
                                        } else {
                                            setQueue(
                                                renderSongs.slice(
                                                    renderSongs.indexOf(
                                                        completeName,
                                                    ),
                                                ),
                                            );
                                        }
                                        playSong(completeName);
                                    }}
                                    onContextMenu={(e) =>
                                        onSongContextMenu({
                                            song: completeName,
                                            e,
                                        })
                                    }
                                    onAddToQueue={(e) => {
                                        createTween(e);
                                        const newQueue = queue.slice();
                                        if (!currentPlay) {
                                            newQueue.push(completeName);
                                        }
                                        const index =
                                            queue.indexOf(currentPlay);
                                        newQueue.splice(
                                            index + 1,
                                            0,
                                            completeName,
                                        );
                                        setQueue(newQueue);
                                    }}
                                />
                            );
                        })}
                    </div>
                </div>
                <div className='free-music-content-lyric'>
                    {currentPlay ? (
                        <LyricPanel
                            name={currentName}
                            artist={currentArtist}
                            lyric={lyric.filter((a) => a.text)}
                            time={time}
                            offset={1.2}
                        />
                    ) : null}
                </div>
            </div>
            <div className='free-music-control'>
                <PlayControll
                    time={time}
                    duration={duration}
                    volume={volume}
                    isPlaying={isPlaying}
                    currentPlay={currentPlay}
                    queue={queue}
                    onSongQueuePlay={playSong}
                    onBack={() => {
                        playSong(queue[queue.indexOf(currentPlay) - 1]);
                    }}
                    onNext={() => {
                        playSong(queue[queue.indexOf(currentPlay) + 1]);
                    }}
                    onPause={() => {
                        suspendPlay();
                    }}
                    onPlay={() => {
                        setIsPlaying(true);
                        playBuffer(time);
                    }}
                    onChange={(t: number) => {
                        setTime(t);
                    }}
                    onAfterChange={(t: number) => {
                        if (isPlaying) {
                            suspendPlay();
                            playBuffer(t);
                        } else {
                            setTime(t);
                        }
                    }}
                    onVolumeChange={(volume) => {
                        setVolume(volume);
                    }}
                    onVolumeAfterChange={(volume) => {
                        if (!audioSource.current) {
                            return;
                        }
                        volumeNode.current.gain.value = volume / 100;
                    }}
                />
            </div>
            <Menu id={MENU_ID}>
                <Submenu label='添加到歌单'>
                    {list
                        .filter((a) => !a.songs.includes(currentHandleSong))
                        .map((a) => (
                            <Item
                                onClick={() => addSongToList(a.id)}
                                key={a.id}
                            >
                                {a.name}
                            </Item>
                        ))}
                </Submenu>
            </Menu>
            <Modal
                title='设置'
                visible={showConfig}
                closable={false}
                footer={
                    <Button
                        onClick={() => {
                            configRef.current.validateFields();
                            const data = configRef.current.getFieldsValue();
                            if (!data.musicDir) {
                                return;
                            }
                            ipcRenderer.invoke('set-config', data).then(() => {
                                setConfig(data);
                            });
                            setShowConfig(false);
                        }}
                    >
                        确定
                    </Button>
                }
            >
                <Form
                    ref={configRef}
                    name='config'
                    labelCol={{ span: 8 }}
                    wrapperCol={{ span: 16 }}
                >
                    {Object.keys(config).map((key) => (
                        <Form.Item
                            key={key}
                            label={key}
                            name={key}
                            rules={[
                                {
                                    required: true,
                                    message: 'Please input music direction!',
                                },
                            ]}
                        >
                            <Input />
                        </Form.Item>
                    ))}
                </Form>
            </Modal>
        </div>
    );
};

export default hot(module)(Application);
