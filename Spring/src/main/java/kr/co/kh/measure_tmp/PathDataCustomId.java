package kr.co.kh.measure_tmp;

import lombok.*;

import java.io.Serializable;
import java.util.Objects;
import java.io.Serializable;
import java.util.Objects;

public class PathDataCustomId implements Serializable {

    private String pathId;
    private Integer pathOrder;

    public PathDataCustomId() {}

    public PathDataCustomId(String pathId, Integer pathOrder) {
        this.pathId = pathId;
        this.pathOrder = pathOrder;
    }

    public String getPathId() {
        return pathId;
    }

    public void setPathId(String pathId) {
        this.pathId = pathId;
    }

    public Integer getPathOrder() {
        return pathOrder;
    }

    public void setPathOrder(Integer pathOrder) {
        this.pathOrder = pathOrder;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof PathDataCustomId)) return false;
        PathDataCustomId that = (PathDataCustomId) o;
        return Objects.equals(pathId, that.pathId) &&
                Objects.equals(pathOrder, that.pathOrder);
    }

    @Override
    public int hashCode() {
        return Objects.hash(pathId, pathOrder);
    }
}
