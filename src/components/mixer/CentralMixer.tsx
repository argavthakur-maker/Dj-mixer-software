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

const channelAPrimary = '#06B6D4';
const channelASecondary = '#15758E';
const channelAGlow = 'rgba(6, 182, 212, 0.35)';
const channelBPrimary = '#8B5CF6';
const channelBSecondary = '#6A2A9B';
const channelBGlow = 'rgba(139, 92, 246, 0.35)';

export const CentralMixer: React.FC<CentralMixerProps> = ({
  channelA,
  channelB,
  mixer,
  onUpdateChannelA,
  onUpdateChannelB,
  onUpdateMixer,
}) => {
  return (
    <div className="flex w-full max-w-[420px] bg-[#0A0F1A] border border-[#1E293B] rounded-2xl p-4 shadow-2xl select-none">
      {/* 1. Master & Booth Section */}
      <div className="bg-[#050A12] border border-[#1E293B] rounded-md p-3 flex items-center justify-between gap-3 shadow-inner mb-4">
        {/* Master & Booth Volume Knobs with futuristic glow */}
        <div className="flex items-center gap-4">
          <RotaryKnob
            label="MASTER"
            value={mixer.masterVolume}
            min={0}
            max={1.2}
            defaultValue={0.85}
            unit="%"
            size={42}
            color={channelAPrimary}
            onChange={(val) => onUpdateMixer({ masterVolume: val })}
            className="glow-cyan"
          />
          <RotaryKnob
            label="BOOTH"
            value={mixer.boothVolume}
            min={0}
            max={1.0}
            defaultValue={0.7}
            unit="%"
            size={38}
            color={channelBPrimary}
            onChange={(val) => onUpdateMixer({ boothVolume: val })}
          />
        </div>

        {/* Master Output Stereo VU Meter - large and elegant */}
        <div className="flex items-center gap-2 px-3 py-2 bg-[#060D15] border border-[#1A2238] rounded-md">
          <div className="flex flex-col items-center">
            <span className="text-[8px] font-mono font-bold text-[#06B6D4]">L</span>
            <VuMeter level={mixer.masterMeterL} height={56} width={8} segments={12} />
          </div>
          <div className="flex flex-col items-center">
            <span className="text-[8px] font-mono font-bold text-[#06B6D4]">R</span>
            <VuMeter level={mixer.masterMeterR} height={56} width={8} segments={12} />
          </div>
        </div>

        {/* Headphone Cue Section */}
        <div className="flex items-center gap-3">
          <RotaryKnob
            label="HP VOL"
            value={mixer.headphoneVolume}
            min={0}
            max={1.0}
            defaultValue={0.8}
            unit="%"
            size={34}
            color={channelAPrimary}
            onChange={(val) => onUpdateMixer({ headphoneVolume: val })}
          />
          <RotaryKnob
            label="CUE MIX"
            value={mixer.headphoneMix}
            min={0}
            max={1.0}
            defaultValue={0.5}
            unit=""
            size={32}
            color={channelBPrimary}
            onChange={(val) => onUpdateMixer({ headphoneMix: val })}
          />
        </div>
      </div>

      {/* 2. Dual Channel Strips - slim, professional */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {/* --- CHANNEL A STRIP - Cyan themed */}
        <div className="flex flex-col items-start bg-[#050A14] border border-[#1A2238] rounded-md p-3 shadow-md flex-1">
          <div className="w-full flex items-center justify-between pb-2 border-b border-[#1A2238]">
            <span className="text-[10px] font-mono font-bold text-[#06B6D4]">CH 1 (A)</span>
            <select
              value={mixer.deckAAssign}
              onChange={(e) => onUpdateMixer({ deckAAssign: e.target.value as 'A' | 'THRU' | 'B' })}
              className="bg-[#04070F] text-[8px] font-mono text-slate-300 border border-[#1A2238] rounded px-2 py-1"
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
            size={32}
            color={channelAPrimary}
            onChange={(val) => onUpdateChannelA({ gain: val })}
          />

          {/* 3-Band EQ with Kill buttons - sleek */}
          <div className="flex flex-col gap-1.5 w-full">
            {/* HIGH EQ */}
            <div className="flex items-center justify-between w-full px-1">
              <RotaryKnob
                label="HIGH"
                value={channelA.eqHigh}
                min={-26}
                max={6}
                defaultValue={0}
                unit="dB"
                size={28}
                color={channelAPrimary}
                onChange={(val) => onUpdateChannelA({ eqHigh: val })}
              />
              <button
                onClick={() => onUpdateChannelA({ killHigh: !channelA.killHigh })}
                title="Kill High Frequencies"
                className={`px-1.5 py-1 rounded text-[8px] font-mono font-bold border transition-colors ${
                  channelA.killHigh
                    ? 'bg-cyan-950 text-cyan-400 border-cyan-400 shadow-sm'
                    : 'bg-[#0A1220] text-slate-500 border-[#1A2238] hover:text-cyan-400'
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
                size={28}
                color={channelAPrimary}
                onChange={(val) => onUpdateChannelA({ eqMid: val })}
              />
              <button
                onClick={() => onUpdateChannelA({ killMid: !channelA.killMid })}
                title="Kill Mid Frequencies"
                className={`px-1.5 py-1 rounded text-[8px] font-mono font-bold border transition-colors ${
                  channelA.killMid
                    ? 'bg-cyan-950 text-cyan-400 border-cyan-400 shadow-sm'
                    : 'bg-[#0A1220] text-slate-500 border-[#1A2238] hover:text-cyan-400'
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
                size={28}
                color={channelAPrimary}
                onChange={(val) => onUpdateChannelA({ eqLow: val })}
              />
              <button
                onClick={() => onUpdateChannelA({ killLow: !channelA.killLow })}
                title="Kill Low Frequencies"
                className={`px-1.5 py-1 rounded text-[8px] font-mono font-bold border transition-colors ${
                  channelA.killLow
                    ? 'bg-cyan-950 text-cyan-400 border-cyan-400 shadow-sm'
                    : 'bg-[#0A1220] text-slate-500 border-[#1A2238] hover:text-cyan-400'
                }`}
              >
                KILL
              </button>
            </div>
          </div>

          {/* Color FX Filter (LPF <-> HPF) */}
          <div className="pt-1 w-full border-t border-[#1A2238] flex flex-col items-center">
            <RotaryKnob
              label="FILTER"
              value={channelA.filter}
              min={-1.0}
              max={1.0}
              defaultValue={0}
              unit=""
              size={30}
              color={channelAPrimary}
              onChange={(val) => onUpdateChannelA({ filter: val })}
            />
          </div>

          {/* Headphone CUE (PFL) */}
          <button
            onClick={() => onUpdateChannelA({ cueHeadphone: !channelA.cueHeadphone }) }
            className={`w-full py-2.5 rounded flex items-center justify-center gap-2 font-mono text-[9px] font-bold border transition-all ${
              channelA.cueHeadphone
                ? 'bg-cyan-950 text-black border-cyan-400 shadow-glow-cyan'
                : 'bg-[#0A1220] text-slate-400 border-[#1A2238] hover:text-white'
            }`}
          >
            <Headphones size={13} />
            CUE
          </button>

          {/* Channel Fader & VU Meter */}
          <div className="flex items-center justify-center gap-2 mt-3 pt-3 w-full">
            <VuMeter level={channelA.meterLeft} height={80} width={8} segments={12} />
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={channelA.faderVolume}
              onChange={(e) => onUpdateChannelA({ faderVolume: parseFloat(e.target.value) })}
              className="vertical-fader h-[80px]"
            />
          </div>
        </div>

        {/* --- CHANNEL B STRIP - Magenta/Violet themed */}
        <div className="flex flex-col items-start bg-[#080E16] border border-[#1A2238] rounded-md p-3 shadow-md flex-1">
          <div className="w-full flex items-center justify-between pb-2 border-b border-[#1A2238]">
            <span className="text-[10px] font-mono font-bold text-[#A855F7]">CH 2 (B)</span>
            <select
              value={mixer.deckBAssign}
              onChange={(e) => onUpdateMixer({ deckBAssign: e.target.value as 'A' | 'THRU' | 'B' })}
              className="bg-[#04070F] text-[8px] font-mono text-slate-300 border border-[#1A2238] rounded px-2 py-1"
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
            size={32}
            color={channelBPrimary}
            onChange={(val) => onUpdateChannelB({ gain: val })}
          />

          {/* 3-Band EQ with Kill buttons */}
          <div className="flex flex-col gap-1.5 w-full">
            {/* HIGH EQ */}
            <div className="flex items-center justify-between w-full px-1">
              <RotaryKnob
                label="HIGH"
                value={channelB.eqHigh}
                min={-26}
                max={6}
                defaultValue={0}
                unit="dB"
                size={28}
                color={channelBPrimary}
                onChange={(val) => onUpdateChannelB({ eqHigh: val })}
              />
              <button
                onClick={() => onUpdateChannelB({ killHigh: !channelB.killHigh })}
                title="Kill High Frequencies"
                className={`px-1.5 py-1 rounded text-[8px] font-mono font-bold border transition-colors ${
                  channelB.killHigh
                    ? 'bg-fuchsia-950 text-fuchsia-400 border-fuchsia-400 shadow-sm'
                    : 'bg-[#0A1220] text-slate-500 border-[#1A2238] hover:text-fuchsia-400'
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
                size={28}
                color={channelBPrimary}
                onChange={(val) => onUpdateChannelB({ eqMid: val })}
              />
              <button
                onClick={() => onUpdateChannelB({ killMid: !channelB.killMid })}
                title="Kill Mid Frequencies"
                className={`px-1.5 py-1 rounded text-[8px] font-mono font-bold border transition-colors ${
                  channelB.killMid
                    ? 'bg-fuchsia-950 text-fuchsia-400 border-fuchsia-400 shadow-sm'
                    : 'bg-[#0A1220] text-slate-500 border-[#1A2238] hover:text-fuchsia-400'
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
                size={28}
                color={channelBPrimary}
                onChange={(val) => onUpdateChannelB({ eqLow: val })}
              />
              <button
                onClick={() => onUpdateChannelB({ killLow: !channelB.killLow })}
                title="Kill Low Frequencies"
                className={`px-1.5 py-1 rounded text-[8px] font-mono font-bold border transition-colors ${
                  channelB.killLow
                    ? 'bg-fuchsia-950 text-fuchsia-400 border-fuchsia-400 shadow-sm'
                    : 'bg-[#0A1220] text-slate-500 border-[#1A2238] hover:text-fuchsia-400'
                }`}
              >
                KILL
              </button>
            </div>
          </div>

          {/* Color FX Filter (LPF <-> HPF) */}
          <div className="pt-1 w-full border-t border-[#1A2238] flex flex-col items-center">
            <RotaryKnob
              label="FILTER"
              value={channelB.filter}
              min={-1.0}
              max={1.0}
              defaultValue={0}
              unit=""
              size={30}
              color={channelBPrimary}
              onChange={(val) => onUpdateChannelB({ filter: val })}
            />
          </div>

          {/* Headphone CUE (PFL) */}
          <button
            onClick={() => onUpdateChannelB({ cueHeadphone: !channelB.cueHeadphone }) }
            className={`w-full py-2.5 rounded flex items-center justify-center gap-2 font-mono text-[9px] font-bold border transition-all ${
              channelB.cueHeadphone
                ? 'bg-fuchsia-950 text-black border-fuchsia-400 shadow-glow-magenta'
                : 'bg-[#0A1220] text-slate-400 border-[#1A2238] hover:text-white'
            }`}
          >
            <Headphones size={13} />
            CUE
          </button>

          {/* Channel Fader & VU Meter */}
          <div className="flex items-center justify-center gap-2 mt-3 pt-3 w-full">
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={channelB.faderVolume}
              onChange={(e) => onUpdateChannelB({ faderVolume: parseFloat(e.target.value) })}
              className="vertical-fader h-[80px]"
            />
            <VuMeter level={channelB.meterRight} height={80} width={8} segments={12} />
          </div>
        </div>
      </div>

      {/* 3. Crossfader Section */}
      <div className="bg-[#050A16] border border-[#1A2238] rounded-md p-3 shadow-inner">
        {/* Crossfader Curve & Hamster switch */}
        <div className="flex items-center justify-between text-[8px] font-mono font-bold text-slate-400">
          <div className="flex items-center gap-1">
            <span>CURVE:</span>
            {(['smooth', 'linear', 'scratch'] as const).map((curve) => (
              <button
                key={curve}
                onClick={() => onUpdateMixer({ crossfaderCurve: curve })}
                className={`px-2 py-0.5 rounded uppercase border transition-colors ${
                  mixer.crossfaderCurve === curve
                    ? 'bg-cyan-500 text-black border-cyan-400 font-extrabold'
                    : 'bg-[#0A1220] text-slate-400 border-[#1A2735] hover:text-slate-200'
                }`}
              >
                {curve}
              </button>
            ))}
          </div>

          <button
            onClick={() => onUpdateMixer({ crossfaderReverse: !mixer.crossfaderReverse })}
            title="Hamster / Reverse Crossfader orientation"
            className={`px-2 py-0.5 rounded uppercase border transition-colors ${
              mixer.crossfaderReverse
                ? 'bg-fuchsia-950 text-fuchsia-400 border-fuchsia-500'
                : 'bg-[#0A1220] text-slate-400 border-[#1A2735] hover:text-slate-200'
            }`}
          >
            {mixer.crossfaderReverse ? 'HAMSTER (REV)' : 'NORMAL'}
          </button>
        </div>

        {/* Horizontal Crossfader Slider - futuristic */}
        <div className="relative flex items-center px-3 py-1.5">
          <span className="text-[10px] font-mono font-extrabold text-[#06B6D4] mr-3">A</span>
          <input
            type="range"
            min="-1.0"
            max="1.0"
            step="0.01"
            value={mixer.crossfader}
            onChange={(e) => onUpdateMixer({ crossfader: parseFloat(e.target.value) })}
            className="horizontal-fader flex-1"
          />
          <span className="text-[10px] font-mono font-extrabold text-[#A855F7] ml-3">B</span>
        </div>
      </div>
    </div>
  );
};