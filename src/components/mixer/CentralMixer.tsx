import React from 'react';
import type { ChannelMixerState, MixerState } from '../../types/dj';
import { RotaryKnob } from '../common/RotaryKnob';
import { VuMeter } from '../common/VuMeter';
import { Headphones } from 'lucide-react';

interface CentralMixerProps {
  channelA: ChannelMixerState;
  channelB: ChannelMixerState;
  mixer: MixerState;
  onUpdateChannelA: (patch: Partial<ChannelMixerState>) => void;
  onUpdateChannelB: (patch: Partial<ChannelMixerState>) => void;
  onUpdateMixer: (patch: Partial<MixerState>) => void;
}

export const CentralMixer: React.FC<CentralMixerProps> = ({
  channelA,
  channelB,
  mixer,
  onUpdateChannelA,
  onUpdateChannelB,
  onUpdateMixer,
}) => {
  return (
    <div className="flex flex-col w-[360px] bg-[#10141D] border-x border-[#252B36] p-2.5 justify-between shadow-2xl select-none">
      {/* 1. Master & Booth Section (Top) */}
      <div className="bg-[#090C12] border border-[#1A222F] rounded-md p-2 flex items-center justify-between gap-2 shadow-inner">
        {/* Master & Booth Volume Knobs */}
        <div className="flex items-center gap-2">
          <RotaryKnob
            label="MASTER"
            value={mixer.masterVolume}
            min={0}
            max={1.2}
            defaultValue={0.85}
            unit="%"
            size={34}
            color="#00E5FF"
            onChange={(val) => onUpdateMixer({ masterVolume: val })}
          />
          <RotaryKnob
            label="BOOTH"
            value={mixer.boothVolume}
            min={0}
            max={1.0}
            defaultValue={0.7}
            unit="%"
            size={32}
            color="#8B5CF6"
            onChange={(val) => onUpdateMixer({ boothVolume: val })}
          />
        </div>

        {/* Master Output Stereo VU Meter (L / R) */}
        <div className="flex items-center gap-1.5 px-2 py-1 bg-[#06080D] rounded border border-[#18202C]">
          <div className="flex flex-col items-center">
            <span className="text-[7px] font-mono text-slate-500 font-bold">L</span>
            <VuMeter level={mixer.masterMeterL} height={52} width={6} segments={10} />
          </div>
          <div className="flex flex-col items-center">
            <span className="text-[7px] font-mono text-slate-500 font-bold">R</span>
            <VuMeter level={mixer.masterMeterR} height={52} width={6} segments={10} />
          </div>
        </div>

        {/* Headphone Cue Section */}
        <div className="flex items-center gap-1.5">
          <RotaryKnob
            label="HEADPHONES"
            value={mixer.headphoneVolume}
            min={0}
            max={1.0}
            defaultValue={0.8}
            unit="%"
            size={32}
            color="#F59E0B"
            onChange={(val) => onUpdateMixer({ headphoneVolume: val })}
          />
          <RotaryKnob
            label="CUE MIX"
            value={mixer.headphoneMix}
            min={0}
            max={1.0}
            defaultValue={0.5}
            unit=""
            size={30}
            color="#10B981"
            onChange={(val) => onUpdateMixer({ headphoneMix: val })}
          />
        </div>
      </div>

      {/* 2. Dual Channel Strips (Channel A on left, Channel B on right) */}
      <div className="grid grid-cols-2 gap-2 my-2 flex-1">
        {/* --- CHANNEL A STRIP --- */}
        <div className="flex flex-col items-center bg-[#0C1017] border border-[#1A222F] rounded-md p-2 gap-1.5 shadow-md">
          <div className="w-full flex items-center justify-between pb-1 border-b border-[#18202C]">
            <span className="text-[10px] font-mono font-bold text-cyan-400">CH 1 (A)</span>
            {/* Crossfader Assign */}
            <select
              value={mixer.deckAAssign}
              onChange={(e) => onUpdateMixer({ deckAAssign: e.target.value as 'A' | 'THRU' | 'B' })}
              className="bg-[#080B10] text-[8px] font-mono text-slate-300 border border-[#252E3E] rounded px-1 py-0.5"
            >
              <option value="A">XF: A</option>
              <option value="THRU">THRU</option>
              <option value="B">XF: B</option>
            </select>
          </div>

          {/* Gain / Trim */}
          <RotaryKnob
            label="TRIM"
            value={channelA.gain}
            min={0}
            max={2.0}
            defaultValue={1.0}
            unit="dB"
            size={34}
            color="#00E5FF"
            onChange={(val) => onUpdateChannelA({ gain: val })}
          />

          {/* 3-Band EQ with Kill buttons */}
          <div className="flex flex-col gap-1 w-full items-center">
            {/* HIGH EQ */}
            <div className="flex items-center justify-between w-full px-1">
              <RotaryKnob
                label="HIGH"
                value={channelA.eqHigh}
                min={-26}
                max={6}
                defaultValue={0}
                unit="dB"
                size={34}
                color="#00E5FF"
                onChange={(val) => onUpdateChannelA({ eqHigh: val })}
              />
              <button
                onClick={() => onUpdateChannelA({ killHigh: !channelA.killHigh })}
                title="Kill High Frequencies"
                className={`px-1.5 py-1 rounded text-[8px] font-mono font-bold border transition-colors ${
                  channelA.killHigh
                    ? 'bg-rose-950 text-rose-400 border-rose-500 shadow-sm'
                    : 'bg-[#141A24] text-slate-500 border-[#252E3E] hover:text-slate-300'
                }`}
              >
                KILL
              </button>
            </div>

            {/* MID EQ */}
            <div className="flex items-center justify-between w-full px-1">
              <RotaryKnob
                label="MID"
                value={channelA.eqMid}
                min={-26}
                max={6}
                defaultValue={0}
                unit="dB"
                size={34}
                color="#00E5FF"
                onChange={(val) => onUpdateChannelA({ eqMid: val })}
              />
              <button
                onClick={() => onUpdateChannelA({ killMid: !channelA.killMid })}
                title="Kill Mid Frequencies"
                className={`px-1.5 py-1 rounded text-[8px] font-mono font-bold border transition-colors ${
                  channelA.killMid
                    ? 'bg-rose-950 text-rose-400 border-rose-500 shadow-sm'
                    : 'bg-[#141A24] text-slate-500 border-[#252E3E] hover:text-slate-300'
                }`}
              >
                KILL
              </button>
            </div>

            {/* LOW EQ */}
            <div className="flex items-center justify-between w-full px-1">
              <RotaryKnob
                label="LOW"
                value={channelA.eqLow}
                min={-26}
                max={6}
                defaultValue={0}
                unit="dB"
                size={34}
                color="#00E5FF"
                onChange={(val) => onUpdateChannelA({ eqLow: val })}
              />
              <button
                onClick={() => onUpdateChannelA({ killLow: !channelA.killLow })}
                title="Kill Low Frequencies"
                className={`px-1.5 py-1 rounded text-[8px] font-mono font-bold border transition-colors ${
                  channelA.killLow
                    ? 'bg-rose-950 text-rose-400 border-rose-500 shadow-sm'
                    : 'bg-[#141A24] text-slate-500 border-[#252E3E] hover:text-slate-300'
                }`}
              >
                KILL
              </button>
            </div>
          </div>

          {/* Color FX Filter (LPF <-> HPF) */}
          <div className="pt-1 w-full border-t border-[#18202C] flex flex-col items-center">
            <RotaryKnob
              label="FILTER (COLOR)"
              value={channelA.filter}
              min={-1.0}
              max={1.0}
              defaultValue={0}
              unit=""
              size={36}
              color={channelA.filter < 0 ? '#38BDF8' : channelA.filter > 0 ? '#EC4899' : '#00E5FF'}
              onChange={(val) => onUpdateChannelA({ filter: val })}
            />
          </div>

          {/* Headphone CUE (PFL) */}
          <button
            onClick={() => onUpdateChannelA({ cueHeadphone: !channelA.cueHeadphone })}
            className={`w-full py-1 rounded flex items-center justify-center gap-1 font-mono text-[9px] font-bold border transition-all ${
              channelA.cueHeadphone
                ? 'bg-amber-500 text-black border-amber-400 shadow-glow-amber'
                : 'bg-[#121622] text-slate-400 border-[#202736] hover:text-white'
            }`}
          >
            <Headphones size={11} />
            CUE
          </button>

          {/* Channel Fader & VU Meter */}
          <div className="flex items-center justify-center gap-2 mt-auto pt-2 w-full">
            <VuMeter level={channelA.meterLeft} height={105} width={7} segments={12} />
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={channelA.faderVolume}
              onChange={(e) => onUpdateChannelA({ faderVolume: parseFloat(e.target.value) })}
              className="vertical-fader h-[105px]"
            />
          </div>
        </div>

        {/* --- CHANNEL B STRIP --- */}
        <div className="flex flex-col items-center bg-[#0C1017] border border-[#1A222F] rounded-md p-2 gap-1.5 shadow-md">
          <div className="w-full flex items-center justify-between pb-1 border-b border-[#18202C]">
            <span className="text-[10px] font-mono font-bold text-fuchsia-400">CH 2 (B)</span>
            <select
              value={mixer.deckBAssign}
              onChange={(e) => onUpdateMixer({ deckBAssign: e.target.value as 'A' | 'THRU' | 'B' })}
              className="bg-[#080B10] text-[8px] font-mono text-slate-300 border border-[#252E3E] rounded px-1 py-0.5"
            >
              <option value="A">XF: A</option>
              <option value="THRU">THRU</option>
              <option value="B">XF: B</option>
            </select>
          </div>

          {/* Gain / Trim */}
          <RotaryKnob
            label="TRIM"
            value={channelB.gain}
            min={0}
            max={2.0}
            defaultValue={1.0}
            unit="dB"
            size={34}
            color="#D946EF"
            onChange={(val) => onUpdateChannelB({ gain: val })}
          />

          {/* 3-Band EQ with Kill buttons */}
          <div className="flex flex-col gap-1 w-full items-center">
            {/* HIGH EQ */}
            <div className="flex items-center justify-between w-full px-1">
              <RotaryKnob
                label="HIGH"
                value={channelB.eqHigh}
                min={-26}
                max={6}
                defaultValue={0}
                unit="dB"
                size={34}
                color="#D946EF"
                onChange={(val) => onUpdateChannelB({ eqHigh: val })}
              />
              <button
                onClick={() => onUpdateChannelB({ killHigh: !channelB.killHigh })}
                title="Kill High Frequencies"
                className={`px-1.5 py-1 rounded text-[8px] font-mono font-bold border transition-colors ${
                  channelB.killHigh
                    ? 'bg-rose-950 text-rose-400 border-rose-500 shadow-sm'
                    : 'bg-[#141A24] text-slate-500 border-[#252E3E] hover:text-slate-300'
                }`}
              >
                KILL
              </button>
            </div>

            {/* MID EQ */}
            <div className="flex items-center justify-between w-full px-1">
              <RotaryKnob
                label="MID"
                value={channelB.eqMid}
                min={-26}
                max={6}
                defaultValue={0}
                unit="dB"
                size={34}
                color="#D946EF"
                onChange={(val) => onUpdateChannelB({ eqMid: val })}
              />
              <button
                onClick={() => onUpdateChannelB({ killMid: !channelB.killMid })}
                title="Kill Mid Frequencies"
                className={`px-1.5 py-1 rounded text-[8px] font-mono font-bold border transition-colors ${
                  channelB.killMid
                    ? 'bg-rose-950 text-rose-400 border-rose-500 shadow-sm'
                    : 'bg-[#141A24] text-slate-500 border-[#252E3E] hover:text-slate-300'
                }`}
              >
                KILL
              </button>
            </div>

            {/* LOW EQ */}
            <div className="flex items-center justify-between w-full px-1">
              <RotaryKnob
                label="LOW"
                value={channelB.eqLow}
                min={-26}
                max={6}
                defaultValue={0}
                unit="dB"
                size={34}
                color="#D946EF"
                onChange={(val) => onUpdateChannelB({ eqLow: val })}
              />
              <button
                onClick={() => onUpdateChannelB({ killLow: !channelB.killLow })}
                title="Kill Low Frequencies"
                className={`px-1.5 py-1 rounded text-[8px] font-mono font-bold border transition-colors ${
                  channelB.killLow
                    ? 'bg-rose-950 text-rose-400 border-rose-500 shadow-sm'
                    : 'bg-[#141A24] text-slate-500 border-[#252E3E] hover:text-slate-300'
                }`}
              >
                KILL
              </button>
            </div>
          </div>

          {/* Color FX Filter (LPF <-> HPF) */}
          <div className="pt-1 w-full border-t border-[#18202C] flex flex-col items-center">
            <RotaryKnob
              label="FILTER (COLOR)"
              value={channelB.filter}
              min={-1.0}
              max={1.0}
              defaultValue={0}
              unit=""
              size={36}
              color={channelB.filter < 0 ? '#38BDF8' : channelB.filter > 0 ? '#EC4899' : '#D946EF'}
              onChange={(val) => onUpdateChannelB({ filter: val })}
            />
          </div>

          {/* Headphone CUE (PFL) */}
          <button
            onClick={() => onUpdateChannelB({ cueHeadphone: !channelB.cueHeadphone })}
            className={`w-full py-1 rounded flex items-center justify-center gap-1 font-mono text-[9px] font-bold border transition-all ${
              channelB.cueHeadphone
                ? 'bg-amber-500 text-black border-amber-400 shadow-glow-amber'
                : 'bg-[#121622] text-slate-400 border-[#202736] hover:text-white'
            }`}
          >
            <Headphones size={11} />
            CUE
          </button>

          {/* Channel Fader & VU Meter */}
          <div className="flex items-center justify-center gap-2 mt-auto pt-2 w-full">
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={channelB.faderVolume}
              onChange={(e) => onUpdateChannelB({ faderVolume: parseFloat(e.target.value) })}
              className="vertical-fader h-[105px]"
            />
            <VuMeter level={channelB.meterRight} height={105} width={7} segments={12} />
          </div>
        </div>
      </div>

      {/* 3. Crossfader Section (Bottom) */}
      <div className="bg-[#0A0D14] border border-[#1C2330] rounded-md p-2 flex flex-col gap-1.5 shadow-inner">
        {/* Crossfader Curve & Hamster switch */}
        <div className="flex items-center justify-between text-[8px] font-mono font-bold text-slate-400">
          <div className="flex items-center gap-1">
            <span>CURVE:</span>
            {(['smooth', 'linear', 'scratch'] as const).map((curve) => (
              <button
                key={curve}
                onClick={() => onUpdateMixer({ crossfaderCurve: curve })}
                className={`px-1.5 py-0.5 rounded uppercase border transition-colors ${
                  mixer.crossfaderCurve === curve
                    ? 'bg-cyan-500 text-black border-cyan-400 font-extrabold'
                    : 'bg-[#121622] text-slate-400 border-[#202735] hover:text-slate-200'
                }`}
              >
                {curve}
              </button>
            ))}
          </div>

          <button
            onClick={() => onUpdateMixer({ crossfaderReverse: !mixer.crossfaderReverse })}
            title="Hamster / Reverse Crossfader orientation"
            className={`px-1.5 py-0.5 rounded uppercase border transition-colors ${
              mixer.crossfaderReverse
                ? 'bg-rose-950 text-rose-400 border-rose-500'
                : 'bg-[#121622] text-slate-400 border-[#202735] hover:text-slate-200'
            }`}
          >
            {mixer.crossfaderReverse ? 'HAMSTER (REV)' : 'NORMAL'}
          </button>
        </div>

        {/* Horizontal Crossfader Slider */}
        <div className="relative flex items-center px-2 py-1">
          <span className="text-[10px] font-mono font-extrabold text-cyan-400 mr-2">A</span>
          <input
            type="range"
            min="-1.0"
            max="1.0"
            step="0.01"
            value={mixer.crossfader}
            onChange={(e) => onUpdateMixer({ crossfader: parseFloat(e.target.value) })}
            className="horizontal-fader flex-1"
          />
          <span className="text-[10px] font-mono font-extrabold text-fuchsia-400 ml-2">B</span>
        </div>
      </div>
    </div>
  );
};
