CREATE TABLE friend_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sender_id UUID NOT NULL REFERENCES users(id),
    receiver_id UUID NOT NULL REFERENCES users(id),
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,


    CONSTRAINT unique_friendship UNIQUE (sender_id, receiver_id)
);

CREATE INDEX idx_friend_requests_sender ON friend_requests(sender_id);
CREATE INDEX idx_friend_requests_receiver ON friend_requests(receiver_id);