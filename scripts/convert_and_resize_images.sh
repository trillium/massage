#!/bin/bash

# pnpm convert-images -i ../images/chair -o ../images-out/chair -d square -f
# pnpm convert-images -i ../images/table -o ../images-out/table -d square -f

# pnpm convert-images -i ../images/chair -o ../images-out/chair -d square -f --filename chair
# pnpm convert-images -i ../images/table -o ../images-out/table -d square -f --filename table

# mkdir -p ./public/static/images/
# cp -Rf ../images-out/table ./public/static/images/table
# cp -Rf ../images-out/chair ./public/static/images/chair

# ## CLEAR SCRIPT

# rm -rf ../images-out/table/* ../images-out/chair/*


# Function to display usage instructions
usage() {
  echo "Usage: $0 -i <input_path> -o <output_path> -d <dimension> [-f <true|false>] [--mock] [--filename <prefix>]"
  echo "  -i: Input file or folder"
  echo "  -o: Output folder"
  echo "  -d: Dimension type (square, portrait, landscape)"
  echo "  -f: Overwrite output files without prompt (true/false)"
  echo "  --mock: Enable mock mode (commands will not be executed)"
  echo "  --filename: Prefix for output filenames"
  exit 1
}

# Parse arguments manually
while [[ $# -gt 0 ]]; do
  case $1 in
    -i|--input)
      input_path="$2"
      shift 2
      ;;
    -o|--output)
      output_path="$2"
      shift 2
      ;;
    -d|--dimension)
      dimension="$2"
      shift 2
      ;;
    -f|--force)
      overwrite="true"
      shift
      ;;
    --mock)
      mock_mode="true"
      shift
      ;;
    --filename)
      filename="$2"
      shift 2
      ;;
    *)
      echo "Unknown argument: $1"
      usage
      ;;
  esac
done

# Validate arguments
if [ -z "$input_path" ] || [ -z "$output_path" ] || [ -z "$dimension" ]; then
  usage
fi

# Ensure ffmpeg is installed
if ! command -v ffmpeg &> /dev/null; then
  echo "Error: ffmpeg is not installed. Please install it and try again."
  exit 1
fi

# Create output directory if it doesn't exist
mkdir -p "$output_path"

# Set overwrite flag for ffmpeg
overwrite_flag="-n" # Default to not overwriting files
if [ "$overwrite" == "true" ]; then
  overwrite_flag="-y"
fi

# Debugging: Print overwrite flag, mock mode, and filename
echo "Overwrite flag set to: $overwrite_flag"
echo "Mock mode: $mock_mode"
echo "Filename prefix: $filename"

# Function to process a single image
process_image() {
  local input_file="$1"
  local output_file="$2"
  local order="$3"
  local command

  case $dimension in
    square)
      command="ffmpeg $overwrite_flag -i \"$input_file\" -vf \"crop='min(iw,ih):min(iw,ih)',scale=512:512\" -q:v 80 \"$output_file\""
      ;;
    portrait)
      command="ffmpeg $overwrite_flag -i \"$input_file\" -vf \"scale='if(gt(iw,ih),512,-1)':512\" -q:v 80 \"$output_file\""
      ;;
    landscape)
      command="ffmpeg $overwrite_flag -i \"$input_file\" -vf \"scale=512:'if(gt(iw,ih),-1,512)'\" -q:v 80 \"$output_file\""
      ;;
    *)
      echo "Error: Invalid dimension type. Use square, portrait, or landscape."
      exit 1
      ;;
  esac

  echo "Running command: $command"
  if [ "$mock_mode" != "true" ]; then
    eval $command
  else
    echo "Mock mode enabled: Command not executed."
  fi
}

# Process input
if [ -d "$input_path" ]; then
  # Input is a directory
  order=1
  for file in "$input_path"/*.{jpg,jpeg,png,heic}; do
    [ -e "$file" ] || continue # Skip if no matching files
    output_file="$output_path/${filename}_${dimension}_$(printf '%02d' $order).webp"
    process_image "$file" "$output_file" "$order"
    order=$((order + 1))
  done
elif [ -f "$input_path" ]; then
  # Input is a single file
  output_file="$output_path/${filename}_${dimension}_01.webp"
  process_image "$input_path" "$output_file" "1"
else
  echo "Error: Input path is neither a file nor a directory."
  exit 1
fi

echo "Processing complete. Converted images are saved in $output_path."
