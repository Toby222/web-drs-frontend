FROM archlinux
RUN pacman-key --init
RUN pacman-key --populate
RUN pacman --noconfirm -Syu git
RUN git config core.editor code --wait