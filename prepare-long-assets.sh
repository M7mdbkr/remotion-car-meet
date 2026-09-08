#!/usr/bin/env bash
set -euo pipefail

project_dir=$(cd "$(dirname "$0")" && pwd)
source_dir="${CAR_MEET_SOURCE_DIR:-$project_dir/assets}"
output_dir="$project_dir/public/story-clips"
mkdir -p "$output_dir"

render_segment() {
  local output_name=$1
  local clip_id=$2
  local start=$3
  local duration=$4
  local audio_kind=$5
  local source dimensions width height audio_filter

  source=$(find "$source_dir" -maxdepth 1 -type f -name "DJI_20260710*_${clip_id}_D.MP4" -print -quit)
  if [[ -z "$source" ]]; then
    printf 'Missing source for clip %s\n' "$clip_id" >&2
    return 1
  fi

  case "$audio_kind" in
    dialogue)
      audio_filter="highpass=f=85,lowpass=f=12500,acompressor=threshold=-23dB:ratio=2.6:attack=8:release=160:makeup=3,loudnorm=I=-16:TP=-1.5:LRA=7"
      ;;
    action)
      audio_filter="highpass=f=40,alimiter=limit=0.88:attack=5:release=80,loudnorm=I=-18:TP=-1.0:LRA=12"
      ;;
    *)
      audio_filter="highpass=f=55,alimiter=limit=0.82:attack=5:release=100,loudnorm=I=-22:TP=-2.0:LRA=11"
      ;;
  esac

  dimensions=$(ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=p=0:s=x "$source")
  width=${dimensions%x*}
  height=${dimensions#*x}

  if (( width > height )); then
    ffmpeg -nostdin -hide_banner -loglevel error -y -ss "$start" -i "$source" -t "$duration" \
      -filter_complex "[0:v]split=2[bg][fg];[bg]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,gblur=sigma=30,eq=brightness=-0.13:contrast=0.94:saturation=1.12[bg];[fg]scale=1080:1920:force_original_aspect_ratio=decrease[fg];[bg][fg]overlay=(W-w)/2:(H-h)/2,eq=contrast=1.055:saturation=1.08,setsar=1[v]" \
      -map "[v]" -map 0:a:0 -af "$audio_filter" -r 30 -c:v libx264 -preset fast -crf 17 -profile:v high -pix_fmt yuv420p \
      -c:a aac -b:a 192k -ar 48000 -movflags +faststart "$output_dir/${output_name}.mp4"
  else
    ffmpeg -nostdin -hide_banner -loglevel error -y -ss "$start" -i "$source" -t "$duration" \
      -vf "scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,eq=brightness=0.025:contrast=1.065:saturation=1.105,setsar=1" \
      -map 0:v:0 -map 0:a:0 -af "$audio_filter" -r 30 -c:v libx264 -preset fast -crf 17 -profile:v high -pix_fmt yuv420p \
      -c:a aac -b:a 192k -ar 48000 -movflags +faststart "$output_dir/${output_name}.mp4"
  fi
  printf 'Prepared %-20s from clip %s (%ss, %s)\n' "$output_name" "$clip_id" "$duration" "$audio_kind"
}

export -f render_segment
export source_dir output_dir

pids=()
while IFS=$'\t' read -r output_name clip_id start duration audio_kind; do
  render_segment "$output_name" "$clip_id" "$start" "$duration" "$audio_kind" &
  pids+=("$!")
  if (( ${#pids[@]} >= 3 )); then
    wait "${pids[0]}"
    pids=("${pids[@]:1}")
  fi
done < "$project_dir/segments-long.tsv"
for pid in "${pids[@]}"; do
  wait "$pid"
done

printf 'Prepared all long-story assets without music.\n'
