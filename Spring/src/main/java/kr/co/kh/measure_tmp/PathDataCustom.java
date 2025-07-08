package kr.co.kh.measure_tmp;

import javax.persistence.*;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonProperty;
@Entity
@Table(name = "PATH_DATA_CUSTOM", schema = "TEAM4FINAL")
@IdClass(PathDataCustomId.class)
@Getter
@Setter
public class PathDataCustom {

    @Id
    @Column(name = "PATH_ID")
    @JsonProperty("path_id")
    private String pathId;

    @Id
    @Column(name = "PATH_ORDER")
    @JsonProperty("path_order")
    private Integer pathOrder;

    @Column(name = "LOCATION_X", precision = 20, scale = 10)
    @JsonProperty("location_x")
    private Double locationX;

    @Column(name = "LOCATION_Y", precision = 20, scale = 10)
    @JsonProperty("location_y")
    private Double locationY;
}

