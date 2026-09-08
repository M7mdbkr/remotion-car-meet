#!/usr/bin/env bash
set -euo pipefail

project_dir=$(cd "$(dirname "$0")" && pwd)
source_dir="${CAR_MEET_SOURCE_DIR:-$project_dir/assets}"
output_dir="$project_dir/public/clips"
mkdir -p "$output_dir" "$project_dir/public/audio" "$project_dir/public/sfx"

render_segment() {
  local output_name=$1
  local clip_id=$2
  local start=$3
  local duration=$4
  local source
  source=$(find "$source_dir" -maxdepth 1 -type f -name "DJI_20260710*_${clip_id}_D.MP4" -print -quit)
  if [[ -z "$source" ]]; then
    printf 'Missing source for clip %s\n' "$clip_id" >&2
    return 1
  fi

  local dimensions width height
  dimensions=$(ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=p=0:s=x "$source")
  width=${dimensions%x*}
  height=${dimensions#*x}

  if (( width > height )); then
    ffmpeg -nostdin -hide_banner -loglevel error -y -ss "$start" -i "$source" -t "$duration" \
      -filter_complex "[0:v]split=2[bg][fg];[bg]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,gblur=sigma=26,eq=brightness=-0.10:contrast=0.92:saturation=1.18[bg];[fg]scale=1080:1920:force_original_aspect_ratio=decrease[fg];[bg][fg]overlay=(W-w)/2:(H-h)/2,eq=contrast=1.06:saturation=1.10,setsar=1[v]" \
      -map "[v]" -map 0:a:0? -r 30 -c:v libx264 -preset fast -crf 17 -profile:v high -pix_fmt yuv420p \
      -c:a aac -b:a 192k -ar 48000 -movflags +faststart "$output_dir/${output_name}.mp4"
  else
    ffmpeg -nostdin -hide_banner -loglevel error -y -ss "$start" -i "$source" -t "$duration" \
      -vf "scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,eq=brightness=0.035:contrast=1.08:saturation=1.16,setsar=1" \
      -map 0:v:0 -map 0:a:0? -r 30 -c:v libx264 -preset fast -crf 17 -profile:v high -pix_fmt yuv420p \
      -c:a aac -b:a 192k -ar 48000 -movflags +faststart "$output_dir/${output_name}.mp4"
  fi
  printf 'Prepared %-18s from clip %s\n' "$output_name" "$clip_id"
}

export -f render_segment
export source_dir output_dir

pids=()
while IFS=$'\t' read -r output_name clip_id start duration; do
  render_segment "$output_name" "$clip_id" "$start" "$duration" &
  pids+=("$!")
  if (( ${#pids[@]} >= 3 )); then
    wait "${pids[0]}"
    pids=("${pids[@]:1}")
  fi
done < "$project_dir/segments.tsv"
for pid in "${pids[@]}"; do
  wait "$pid"
done

ffmpeg -nostdin -hide_banner -loglevel error -y \
  -i '/Library/Audio/Apple Loops/Apple/09 Disco Funk/Glitter Nights Beat.caf' \
  -c:a aac -b:a 256k -ar 48000 "$project_dir/public/audio/glitter-nights-beat.m4a"

ffmpeg -nostdin -hide_banner -loglevel error -y \
  -i '/Library/Audio/Apple Loops/Apple/09 Disco Funk/Glitter Nights Synth Bass 01.caf' \
  -c:a aac -b:a 192k -ar 48000 "$project_dir/public/audio/glitter-nights-bass.m4a"

curl -fsSL 'https://remotion.media/whoosh.wav' -o "$project_dir/public/sfx/whoosh.wav"
curl -fsSL 'https://remotion.media/shutter-modern.wav' -o "$project_dir/public/sfx/shutter.wav"
curl -fsSL 'https://remotion.media/ding.wav' -o "$project_dir/public/sfx/ding.wav"

printf 'Audio and sound effects prepared.\n'
