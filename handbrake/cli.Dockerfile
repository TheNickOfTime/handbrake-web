ARG HANDBRAKE_BUILD_TAG=latest

FROM handbrake-build:dev AS handbrake-build

# Final image --------------------------------------------------------------------------------------
FROM gcr.io/distroless/base-debian12 AS main

COPY --from=handbrake-build /rootfs/base/ /
# COPY --from=handbrake-build /rootfs/extra/ /

ENTRYPOINT [ "/usr/local/bin/HandBrakeCLI" ]