#! /bin/bash
#init constants
PROJECT_PREFIX="pkt284"
PROJECT_NAME="rheticus_gui_ps"
IMAGES_REPOSITORY_PATH="dockerhub.planetek.it/"
VERSION="build 1.0.0"
USAGE="
    Usage: $(basename "$0") <image tag> -p <active_profile> -b <base image tag> [-n]
    Description: Script to build docker images of this project.
    Options:
        <image tag>         Use this value as docker image tag
        -b                  Use this value as docker base image tag
        -n                  Avoid pushing the image on docker registry
        -p                  Specify active profile (local | development | staging | production)
        "
set -e
if [ "$#" == "0" ]; then
  echo "$USAGE"
  exit 1
fi
while getopts ":hv" option; do
  case "${option}" in
  h)
    echo "$USAGE"
    exit
    ;;
  v)
    echo "$VERSION"
    exit
    ;;
  \?)
    ;;
  esac
done
#init variables
project_name="$PROJECT_PREFIX""/"${PROJECT_NAME##*/}
is_push="1"
docker_image_tag=$1
if ! [[ "$docker_image_tag" =~ ^[[:alnum:]][[:alnum:]._-]{0,127}$ ]]; then
  echo "Invalid docker image tag name"
  exit 1
fi
shift
while getopts ":nb:p:" option; do
  case "${option}" in
  n)
    is_push="0"
    ;;
  b)
    docker_base_image_tag="${OPTARG}"
    ;;
  p)
    active_profile="${OPTARG}"
    ;;
  :)
    printf "Missing argument for -%s\n" "$OPTARG" >&2
    echo "$USAGE" >&2
    exit 1
    ;;
  \?)
    printf "Illegal option: -%s\n" "$OPTARG" >&2
    echo "$USAGE" >&2
    exit 1
    ;;
  esac
done
shift $((OPTIND - 1))
if [[ ! "$docker_base_image_tag" ]]; then
  echo "-------------------------------------------------------------------"
  echo "| Missing parameter: you need to specify -b <base image tag>      |"
  echo "-------------------------------------------------------------------"
  exit 1
fi
if [[ ! "$active_profile" ]]; then
  echo "-------------------------------------------------------------------"
  echo "| Missing parameter: you need to specify -p <active_profile>      |"
  echo "-------------------------------------------------------------------"
  exit 1
fi

echo ""
base_image_name="$IMAGES_REPOSITORY_PATH""$project_name"_base:"$docker_base_image_tag"
echo "Base image name: "${base_image_name}

image_name="$IMAGES_REPOSITORY_PATH""$project_name":"$docker_image_tag"
echo "Image name: "${image_name}

echo ""
echo ""
echo "-------------------------------------------------------------------"
echo "Build base image: "${base_image_name}
echo ""
docker build -f ./docker/Dockerfile.base -t "$base_image_name" .

echo ""
echo ""
echo "-------------------------------------------------------------------"
echo "Build image: "${image_name}
echo ""
docker build -f ./docker/Dockerfile -t "$image_name" --build-arg base_image="$base_image_name" --build-arg active_profile="$active_profile" .

if [ "$is_push" -eq "1" ]; then
  echo ""
  echo ""
  echo "-------------------------------------------------------------------"
  echo "Push base image: "${base_image_name}
  echo ""
  docker push "$base_image_name"

  echo ""
  echo ""
  echo "-------------------------------------------------------------------"
  echo "Push image: "${image_name}
  echo ""
  docker push "$image_name"
fi