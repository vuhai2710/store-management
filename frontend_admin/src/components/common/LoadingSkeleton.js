import React from "react";
import { Skeleton, Card, Row, Col } from "antd";

const LoadingSkeleton = ({ type = "table", rows = 5, columns = 5 }) => {
  if (type === "table") {
    return (
      <Card>
        <Skeleton active paragraph={{ rows: 0 }} />
        {Array.from({ length: rows }).map((_, index) => (
          <Skeleton
            key={index}
            active
            avatar={false}
            paragraph={{ rows: 1 }}
            title={false}
            style={{ marginTop: "16px" }}
          />
        ))}
      </Card>
    );
  }

  if (type === "card") {
    return (
      <Row gutter={[16, 16]}>
        {Array.from({ length: columns }).map((_, index) => (
          <Col key={index} xs={24} sm={12} md={8} lg={6}>
            <Card>
              <Skeleton active avatar paragraph={{ rows: 2 }} />
            </Card>
          </Col>
        ))}
      </Row>
    );
  }

  if (type === "list") {
    return (
      <div>
        {Array.from({ length: rows }).map((_, index) => (
          <Skeleton
            key={index}
            active
            avatar
            paragraph={{ rows: 2 }}
            style={{ marginBottom: "16px" }}
          />
        ))}
      </div>
    );
  }

  return <Skeleton active />;
};

export default LoadingSkeleton;
