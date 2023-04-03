ARG base_image
ARG active_profile
FROM $base_image as builder
ARG active_profile

WORKDIR /usr/local/rheticus_gui_ps/src
RUN grunt clean build --target=$active_profile --verbose --output-hashing

FROM nginx:alpine
RUN rm -rf /usr/share/nginx/html/*

COPY --from=builder /usr/local/rheticus_gui_ps/src/dist/displacement /usr/share/nginx/html/displacement/
COPY --from=builder /usr/local/rheticus_gui_ps/src/dist/home /usr/share/nginx/html/home/
COPY --from=builder /usr/local/rheticus_gui_ps/nginx/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 8082
CMD ["nginx", "-g", "daemon off;"]