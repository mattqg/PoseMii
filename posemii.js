let video;
let poseNet;
let pose;
let skeleton;
let bubbles = [];
let initTimer = 0
let score = 0

function preload() {
    pose1 = loadImage('/assets/pose1.png');
    pose2 = loadImage('/assets/pose2.png');
    pose3 = loadImage('/assets/pose3.png');
    poses = [pose1, pose2, pose3]
    miipose1 = loadImage('/assets/miipose1.png')
    miipose2 = loadImage('/assets/miipose2.png')
    miipose3 = loadImage('/assets/miipose3.png')
    backgroundImage = loadImage('/assets/galaxy.jpg')
}

function setup() {
    angleMode(DEGREES);
    createCanvas(1000, 600);
    video = createCapture(VIDEO);
    video.hide();
    poseNet = ml5.poseNet(video);
    poseNet.on('pose', gotPoses);
}

class bubble {
    constructor() {
        this.x = random(100, 900);
        this.y = 0;
        this.size = 90;
        this.yspeed = random(1, 3);
        this.poseindex = random([1, 2, 3])
        this.pose = poses[this.poseindex - 1]
        this.rotation = floor(random(-40, 40))
        this.periodSpecifier = random(45, 360)
        if (this.x > windowHeight / 2) {
            this.movementspecifier = random(-2, -1)
        }
        else {
            this.movementspecifier = random(2, 1)
        }

    }

    move() {
        this.x += this.movementspecifier * sin(map(this.y, 0, windowHeight / 4, 0, this.periodSpecifier));
        this.y += this.yspeed;
    }

    display() {
        push()
        translate(this.x, this.y)
        rotate(this.rotation)
        imageMode(CENTER)
        image(this.pose, 0, 0, this.size, this.size);
        pop()
    }
}


function gotPoses(poses) {
    if (poses.length > 0) {
        pose = poses[0].pose;
        skeleton = poses[0].skeleton;
    }
}


function reMapCoords(num, dim) {
    if (dim == 'x') {
        return map(num, 0, 640, 1150, -150)
    }
    return map(num, 0, 480, 0, 600)

}

function objectTimer() {
    if (millis() > initTimer + random(3, 4) * 1000) {
        initTimer = millis()
        let b = new bubble
        bubbles.push(b)
    }
}

function draw() {
    l_gt_r = false
    image(backgroundImage, 0, 0, 1000, 600)
    if (millis() < 3000) {
        fill(255,255,255)
        strokeWeight(3)
        stroke(0,0,0)
        textSize(90)
        textAlign(CENTER)
        text("PoseMii.js", 1000/2, 640/ 2)
    }
    else if (millis() > 3000) {
        objectTimer()
        textSize(32);
        text(score, 10, 30);
    }
    
    if (pose) {
        let currentPose
        x_lw = pose.leftWrist.x
        y_lw = pose.leftWrist.y
        x_rw = pose.rightWrist.x
        y_rw = pose.rightWrist.y
        // Shoulder Points
        x_ls = pose.leftShoulder.x
        y_ls = pose.leftShoulder.y
        x_rs = pose.rightShoulder.x
        y_rs = pose.rightShoulder.y

        nose_x = 1000 - reMapCoords((x_rs + x_ls)/ 2)
        change_in_x = x_rs - x_ls
        change_in_y = y_rs - y_ls
        
        push()
        translate(nose_x, 540)
    
        characterAngle = atan(change_in_x / change_in_y)
        if (y_rs > y_ls) {
            l_gt_r = true
        }

        if (l_gt_r) {
            characterAngle += 90
            rotate(characterAngle)
            m = (y_rs - y_ls) / (x_rs - x_ls)
            b = y_rs - (m * x_rs)
        }
        else {
            characterAngle -= 90
            rotate(characterAngle)
            m = -(y_rs - y_ls) / (x_rs - x_ls)
            b = y_ls - (m * x_ls)
        }

        if (y_lw > (m * x_lw + b) && x_lw > ((y_lw - b) / m) && y_rw > (m * x_rw + b) && x_rw > ((y_rw - b) / m)) {
            currentPose = miipose3
            poseCount = 3
        } else if (y_lw < (m * x_lw + b) && x_lw < ((y_lw - b) / m) && y_rw < (m * x_rw + b) && x_rw < ((y_rw - b) / m)) {
            currentPose = miipose1
            poseCount = 1
        } else {
            currentPose = miipose2
            poseCount = 2
        }
        
        imageMode(CENTER)
        image(currentPose, 0, 0, 63, 63)
        pop()

        for (i = 0; i < bubbles.length; i++) {
            if (bubbles[i] != 0) {
                print(i)
                bubbles[i].move();
                bubbles[i].display();
                if (bubbles[i].y > windowHeight - 200 && bubbles[i].y < windowHeight - 10) {
                    // print(i)
                    if (bubbles[i].x < nose_x + 40 && bubbles[i].x > nose_x - 40) {
                        // print(bubbles[i].poseindex, poseCount)
                        if (bubbles[i].poseindex == poseCount) {
                            if (bubbles[i].rotation >= characterAngle - 15 && bubbles[i].rotation <= characterAngle + 15) {
                                bubbles[i] = 0
                                score += 10
                            }
                        }

                    }

                }
                if (bubbles[i].y > windowHeight - 15) {
                    bubbles[i] = 0
                    score -= 10
                }
            }

        }

        // current angle, bubble angle that we're intersecting



        // // rect((reMapCoords(pose.rightShoulder.x,'x')+reMapCoords(pose.leftShoulder.x,'x'))/2, 0,5,windowHeight)
        // // ellipse(pose.leftShoulder.x, pose.leftShoulder.y, 10, 10)
        // push()
        // strokeWeight(2)
        // stroke(0,255,0)
        // line(reMapCoords(pose.leftShoulder.x,'x'), reMapCoords(pose.leftShoulder.y,'y'), reMapCoords(pose.rightShoulder.x,'x'), reMapCoords(pose.rightShoulder.y,'y'))
        // pop()
        // let d = dist(eyeR.x, eyeR.y, eyeL.x, eyeL.y);
        // fill(255, 0, 0);
        // ellipse(pose.nose.x, pose.nose.y, d);
        // fill(0, 0, 255);
        // ellipse(pose.rightWrist.x, pose.rightWrist.y, 32);
        // ellipse(pose.leftWrist.x, pose.leftWrist.y, 32);

        // for (let i = 0; i < pose.keypoints.length; i++) {
        //   let x = reMapCoords(pose.keypoints[i].position.x,'x');
        //   let y = reMapCoords(pose.keypoints[i].position.y,'y');
        //   fill(0, 255, 0);
        //   ellipse(x, y, 16, 16);
        // }

        //     for (let i = 0; i < skeleton.length; i++) {
        //       let a = skeleton[i][0];
        //       let b = skeleton[i][1];
        //       strokeWeight(2);
        //       stroke(255);
        //       line(a.position.x, a.position.y, b.position.x, b.position.y);
        //     }
    }
}