FROM ubuntu:20.04

ENV DEBIAN_FRONTEND=noninteractive

# Install dependencies, Node.js, and P-Lingua build tools
RUN apt-get update && apt-get install -y \
    build-essential flex bison libboost-filesystem-dev libboost-program-options-dev \
    git curl wget libfl-dev \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

# Install ttyd for web-based terminal
RUN wget -qO- https://github.com/tsl0922/ttyd/releases/download/1.6.3/ttyd.x86_64 \
    | tee /usr/local/bin/ttyd > /dev/null && chmod +x /usr/local/bin/ttyd

# Clone and build P-Lingua
WORKDIR /workspace
RUN git clone https://github.com/RGNC/plingua.git
WORKDIR /workspace/plingua
RUN make grammar && make compiler && make simulator && make install

# Back to main workspace
WORKDIR /workspace

# Expose ports
EXPOSE 3000 7681

# Volume for P-Lingua examples
VOLUME /workspace/plingua/examples

# Volume for mounting Next.js app from host
VOLUME /workspace/app

# Default CMD to run ttyd and Next.js (dev mode)
CMD ttyd -p 7681 bash & \
    cd /workspace/app && npm install && npm run dev
