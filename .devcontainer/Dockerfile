FROM archlinux
RUN pacman-key --init
RUN pacman-key --populate
RUN pacman --noconfirm -Syu git yarn
RUN git config --global core.editor code --wait