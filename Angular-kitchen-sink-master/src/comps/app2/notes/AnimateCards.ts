/**
 *  ngAnimation
 *  reference: http://www.bennadel.com/blog/3139-experimenting-with-conditional-enter-leave-animations-in-angular-2-rc-6.htm
 **/

import { animate } from "@angular/core";
import { ChangeDetectorRef } from "@angular/core";
import { Component } from "@angular/core";
import { style } from "@angular/core";
import { transition } from "@angular/core";
import { trigger } from "@angular/core";


interface Friend {
    id: number;
    name: string;
    favoriteMovie: string;
}

type Orientation = ( "prev" | "next" | "none" );

@Component({
    selector: "AnimateCards",
    styleUrls: ['./AnimateCards.css'],
    animations: [
        trigger(
            "friendAnimation",
            [
                transition(
                    "void => prev", // ---> Entering --->
                    [
                        // In order to maintain a zIndex of 2 throughout the ENTIRE
                        // animation (but not after the animation), we have to define it
                        // in both the initial and target styles. Unfortunately, this
                        // means that we ALSO have to define target values for the rest
                        // of the styles, which we wouldn't normally have to.
                        style({
                            left: -100,
                            opacity: 0.0,
                            zIndex: 2
                        }),
                        animate(
                            "200ms ease-in-out",
                            style({
                                left: 0,
                                opacity: 1.0,
                                zIndex: 2
                            })
                        )
                    ]
                ),
                transition(
                    "prev => void", // ---> Leaving --->
                    [
                        animate(
                            "200ms ease-in-out",
                            style({
                                left: 100,
                                opacity: 0.0
                            })
                        )
                    ]
                ),
                transition(
                    "void => next", // <--- Entering <---
                    [
                        // In order to maintain a zIndex of 2 throughout the ENTIRE
                        // animation (but not after the animation), we have to define it
                        // in both the initial and target styles. Unfortunately, this
                        // means that we ALSO have to define target values for the rest
                        // of the styles, which we wouldn't normally have to.
                        style({
                            left: 100,
                            opacity: 0.0,
                            zIndex: 2
                        }),
                        animate(
                            "200ms ease-in-out",
                            style({
                                left: 0,
                                opacity: 1.0,
                                zIndex: 2
                            })
                        )
                    ]
                ),
                transition(
                    "next => void", // <--- Leaving <---
                    [
                        animate(
                            "200ms ease-in-out",
                            style({
                                left: -100,
                                opacity: 0.0
                            })
                        )
                    ]
                )
            ]
        )
    ],
    template:
        `
		<div class="container">
            <div *ngFor="let friend of selectedFriend">
				<div [@friendAnimation]="orientation" class="friend">

					<div class="name">
						{{ friend.name }}
					</div>
					<div class="avatar"></div>
					<div class="meta">
						ID: {{ friend.id }}
						&mdash;
						Favorite Movie: {{ friend.favoriteMovie }}
					</div>

				</div>
            </div>
		</div>

		<p class="controls">
			&laquo;
			<a (click)="showPrevFriend()">Previous Friend</a>
			&mdash;
			<a (click)="showNextFriend()">Next Friend</a>
			&raquo;
		</p>
	`
})
export class AnimateCards {

    public orientation: Orientation;
    public selectedFriend: Array<Friend> = [];

    private changeDetectorRef: ChangeDetectorRef;
    private friends: Friend[];


    // I initialize the component.
    constructor( changeDetectorRef: ChangeDetectorRef ) {

        this.changeDetectorRef = changeDetectorRef;
        this.orientation = "none";

        // Setup the friends collection.
        this.friends = [
            {
                id: 1,
                name: "Sarah",
                favoriteMovie: "Happy Gilmore"
            },
            {
                id: 2,
                name: "Joanna",
                favoriteMovie: "Better Than Chocolate"
            },
            {
                id: 3,
                name: "Tricia",
                favoriteMovie: "Working Girl"
            },
            {
                id: 4,
                name: "Kim",
                favoriteMovie: "Terminator 2"
            }
        ];

        // Randomly(ish) select the initial friend to display.
        this.selectedFriend = [];
        this.selectedFriend.push(this.friends[ Math.floor( Math.random() * this.friends.length ) ]);

    }


    // ---
    // PUBLIC METHODS.
    // ---


    // I cycle to the next friend in the collection.
    public showNextFriend() : void {

        // Change the "state" for our animation trigger.
        this.orientation = "next";

        // Force the Template to apply the new animation state before we actually
        // change the rendered element view-model. If we don't force a change-detection,
        // the new [@orientation] state won't be applied prior to the "leave" transition;
        // which means that we won't be leaving from the "expected" state.
        this.changeDetectorRef.detectChanges();

        // Find the currently selected index.
        var index = this.friends.indexOf( this.selectedFriend[0] );

        // Move the rendered element to the next index - this will cause the current item
        // to enter the ( "next" => "void" ) transition and this new item to enter the
        // ( "void" => "next" ) transition.
        var res = this.friends[ index + 1 ]
            ? this.friends[ index + 1 ]
            : this.friends[ 0 ]
        ;
        this.selectedFriend = [];
        this.selectedFriend.push(res);

    }


    // I cycle to the previous friend in the collection.
    public showPrevFriend() : void {

        // Change the "state" for our animation trigger.
        this.orientation = "prev";

        // Force the Template to apply the new animation state before we actually
        // change the rendered element view-model. If we don't force a change-detection,
        // the new [@orientation] state won't be applied prior to the "leave" transition;
        // which means that we won't be leaving from the "expected" state.
        this.changeDetectorRef.detectChanges();

        // Find the currently selected index.
        var index = this.friends.indexOf( this.selectedFriend[0] );

        // Move the rendered element to the previous index - this will cause the current
        // item to enter the ( "prev" => "void" ) transition and this new item to enter
        // the ( "void" => "prev" ) transition.
        var res = this.friends[ index - 1 ]
            ? this.friends[ index - 1 ]
            : this.friends[ this.friends.length - 1 ];
        this.selectedFriend = [];
        this.selectedFriend.push(res)


    }

}